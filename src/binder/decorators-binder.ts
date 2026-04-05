/*
 * Copyright 2025 MDReal
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { Bot, Context as GrammyContext, MiddlewareFn, NextFunction } from "grammy";
import { isObservable, lastValueFrom } from "rxjs";

import { Injectable, type OnApplicationBootstrap } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";

import { META_KEYS } from "../decorators";
import { type BotEntry, TelegramBotsRegistry } from "../registry";
import type { CommandMeta, ConversationMeta, HearsMeta, KeyboardCallbackMeta, OnMeta } from "../types";

type PendingConversation = { fn: Function; name: string; botName: string };
type CommandEntry = { command: string; description: string };

/**
 * Compose a stack of grammY middlewares into a single middleware function.
 *
 * Order of execution:
 *   1. Class-level `@Use` middlewares
 *   2. Method-level `@Use` middlewares
 *   3. The handler itself
 */
const compose = <C extends GrammyContext>(middlewares: readonly MiddlewareFn<C>[], handler: MiddlewareFn<C>) => {
  const stack = [...middlewares, handler];
  return async (ctx: C, next: NextFunction) => {
    let i = -1;
    const run = async (idx: number) => {
      if (idx <= i) throw new Error("next() called multiple times");
      i = idx;
      const fn = stack[idx] ?? next;
      if (!fn) return;
      await fn(ctx, () => run(idx + 1));
    };
    await run(0);
  };
};

/**
 * `TelegramDecoratorsBinder`
 *
 * A NestJS provider that runs at application bootstrap and binds
 * all decorated providers (`@Command`, `@Hears`, `@On`, `@Use`)
 * to the corresponding grammY `Bot` instances.
 *
 * It uses Nest's `DiscoveryService` to scan all providers,
 * checks for metadata defined by the decorators, and registers
 * the appropriate handlers with the correct bot(s).
 *
 * ### Scoping Rules
 * - If a provider is decorated with `@Scope("name")` or `@Scopes([...])`,
 *   handlers bind only to those bots.
 * - If only one bot is registered and no scope is set, handlers bind to that bot.
 * - Otherwise, handlers default to binding to all bots.
 */
@Injectable()
export class TelegramDecoratorsBinder implements OnApplicationBootstrap {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly registry: TelegramBotsRegistry
  ) {}

  /** Runs at NestJS bootstrap to wire up all decorated handlers. */
  async onApplicationBootstrap() {
    const providers = this.getEligibleProviders();
    const botNames = this.registry.names();

    if (botNames.length === 0) return;
    const scopeResolver = this.createScopeResolver(botNames);
    await this.bindConversations(providers, scopeResolver);
    const commandsByBot = this.bindHandlers(providers, scopeResolver);
    await this.syncCommands(commandsByBot);
  }

  private getEligibleProviders() {
    return this.discovery
      .getProviders()
      .filter(wrapper => !!wrapper.instance && !!wrapper.metatype && typeof wrapper.metatype === "function");
  }

  private createScopeResolver(allNames: string[]) {
    return (ctor: Function) => {
      let scopes = (Reflect.getMetadata(META_KEYS.SCOPES, ctor) as string[] | undefined) ?? [];

      if (scopes.length === 0 && allNames.length === 1) {
        scopes = allNames;
      }

      if (scopes.length === 0) {
        scopes = allNames;
      }

      return scopes;
    };
  }

  private async bindConversations(
    providers: ReturnType<DiscoveryService["getProviders"]>,
    resolveScopes: (ctor: Function) => string[]
  ) {
    const botsNeedingConversations = new Set<string>();
    const pendingConversations: PendingConversation[] = [];

    for (const wrapper of providers) {
      const ctor = wrapper.metatype as Function;
      const convDefs = (Reflect.getMetadata(META_KEYS.CONVERSATIONS, ctor) as ConversationMeta[] | undefined) ?? [];

      if (convDefs.length === 0) continue;

      for (const botName of resolveScopes(ctor)) {
        botsNeedingConversations.add(botName);

        for (const def of convDefs) {
          pendingConversations.push({
            fn: wrapper.instance[def.method].bind(wrapper.instance),
            name: def.name,
            botName
          });
        }
      }
    }

    if (botsNeedingConversations.size === 0) {
      return;
    }

    let convMod: typeof import("@grammyjs/conversations");

    try {
      convMod = await import("@grammyjs/conversations");
    } catch {
      throw new Error(
        'Optional peer "@grammyjs/conversations" is required when using @Conversation(). ' +
          "Install it: pnpm add @grammyjs/conversations"
      );
    }

    for (const botName of botsNeedingConversations) {
      const entry = this.registry.get(botName) as BotEntry | undefined;
      if (!entry) continue;

      (entry.bot as Bot<any>).use(convMod.conversations());
    }

    for (const { fn, name, botName } of pendingConversations) {
      const entry = this.registry.get(botName) as BotEntry | undefined;
      if (!entry) continue;

      if (!this.registry.guardBinding(`conv:${name}:${botName}`)) continue;

      (entry.bot as Bot<any>).use(convMod.createConversation(fn as any, name));
    }
  }

  private bindHandlers(
    providers: ReturnType<DiscoveryService["getProviders"]>,
    resolveScopes: (ctor: Function) => string[]
  ) {
    const commandsByBot: Record<string, CommandEntry[]> = {};

    for (const wrapper of providers) {
      const instance = wrapper.instance as object;
      const ctor = wrapper.metatype as Function;
      const scopes = resolveScopes(ctor);
      const bindings = this.getClassBindings(ctor);

      if (
        bindings.commands.length === 0 &&
        bindings.hears.length === 0 &&
        bindings.ons.length === 0 &&
        bindings.keyboardCallbacks.length === 0
      ) {
        continue;
      }

      const proto = Object.getPrototypeOf(instance);
      const methodNames = Object.getOwnPropertyNames(proto).filter(name => name !== "constructor");

      for (const methodName of methodNames) {
        const desc = Object.getOwnPropertyDescriptor(proto, methodName);

        if (!desc || typeof desc.value !== "function") {
          continue;
        }

        const methodMiddlewares =
          (Reflect.getMetadata(META_KEYS.METHOD_USE, instance, methodName) as MiddlewareFn[] | undefined) ?? [];

        const methodBindings = this.getMethodBindings(methodName, bindings);

        if (
          methodBindings.commands.length === 0 &&
          methodBindings.hears.length === 0 &&
          methodBindings.ons.length === 0 &&
          methodBindings.keyboardCallbacks.length === 0
        ) {
          continue;
        }

        const handler = this.createHandler(instance, desc.value);
        const composed = compose([...bindings.classMiddlewares, ...methodMiddlewares], handler);

        for (const botName of scopes) {
          const entry = this.registry.get(botName) as BotEntry | undefined;

          if (!entry) {
            continue;
          }

          const bindKey = `${ctor.name}:${methodName}:${botName}`;

          if (!this.registry.guardBinding(bindKey)) {
            continue;
          }

          const bot = entry.bot as Bot;

          this.bindMethodToBot(bot, composed, methodBindings);
          this.collectVisibleCommands(commandsByBot, botName, methodBindings.commands);
        }
      }
    }

    return commandsByBot;
  }

  private createHandler(instance: object, method: Function): MiddlewareFn {
    return async (ctx, next) => {
      const result = method.call(instance, ctx, next);
      await this.executeHandlerResult(result);
    };
  }

  private async executeHandlerResult(result: unknown) {
    if (isObservable(result)) {
      await lastValueFrom(result);
      return;
    }

    await result;
  }

  private getClassBindings(ctor: Function) {
    return {
      classMiddlewares: (Reflect.getMetadata(META_KEYS.CLASS_USE, ctor) as MiddlewareFn[] | undefined) ?? [],
      commands: (Reflect.getMetadata(META_KEYS.COMMANDS, ctor) as CommandMeta[] | undefined) ?? [],
      hears: (Reflect.getMetadata(META_KEYS.HEARS, ctor) as HearsMeta[] | undefined) ?? [],
      ons: (Reflect.getMetadata(META_KEYS.ON, ctor) as OnMeta[] | undefined) ?? [],
      keyboardCallbacks:
        (Reflect.getMetadata(META_KEYS.KEYBOARD_CALLBACKS, ctor) as KeyboardCallbackMeta[] | undefined) ?? []
    };
  }

  private getMethodBindings(methodName: string, bindings: ReturnType<TelegramDecoratorsBinder["getClassBindings"]>) {
    return {
      commands: bindings.commands.filter(command => command.method === methodName),
      hears: bindings.hears.filter(hear => hear.method === methodName),
      ons: bindings.ons.filter(on => on.method === methodName),
      keyboardCallbacks: bindings.keyboardCallbacks.filter(callback => callback.method === methodName)
    };
  }

  private collectVisibleCommands(
    commandsByBot: Record<string, CommandEntry[]>,
    botName: string,
    commands: CommandMeta[]
  ) {
    (commandsByBot[botName] ??= []).push(
      ...commands
        .filter(command => !command.isHidden)
        .map(command => ({
          command: command.command,
          description: command.description ?? ""
        }))
    );
  }

  private bindMethodToBot(
    bot: Bot,
    composed: MiddlewareFn,
    methodBindings: {
      commands: CommandMeta[];
      hears: HearsMeta[];
      ons: OnMeta[];
      keyboardCallbacks: KeyboardCallbackMeta[];
    }
  ) {
    for (const command of methodBindings.commands) {
      bot.command(command.command, composed);
    }

    for (const hear of methodBindings.hears) {
      bot.hears(hear.trigger as any, composed);
    }

    for (const on of methodBindings.ons) {
      bot.on(on.filter as any, composed);
    }

    for (const callback of methodBindings.keyboardCallbacks) {
      bot.callbackQuery(callback.callback as any, composed);
    }
  }

  private async syncCommands(commandsByBot: Record<string, CommandEntry[]>) {
    await Promise.all(
      Object.entries(commandsByBot).map(([botName, commands]) => {
        const entry = this.registry.get(botName) as BotEntry | undefined;

        return entry?.api.setMyCommands(commands);
      })
    );
  }
}
