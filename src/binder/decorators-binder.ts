import type { Bot, Context as GrammyContext, MiddlewareFn } from "grammy";

import { Injectable, type OnApplicationBootstrap } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";

import { META_KEYS } from "../decorators";
import { type BotEntry, TelegramBotsRegistry } from "../registry";

/** Compose middlewares in order: ...classMW, ...methodMW, handler */
const compose = <C extends GrammyContext>(
  middlewares: readonly MiddlewareFn<C>[],
  handler: MiddlewareFn<C>
): MiddlewareFn<C> => {
  const stack = [...middlewares, handler];
  return async (ctx, next) => {
    let i = -1;
    const run = async (idx: number): Promise<void> => {
      if (idx <= i) throw new Error("next() called multiple times");
      i = idx;
      const fn = stack[idx] ?? next;
      if (!fn) return;
      await fn(ctx, () => run(idx + 1));
    };
    await run(0);
  };
};

@Injectable()
export class TelegramDecoratorsBinder implements OnApplicationBootstrap {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly registry: TelegramBotsRegistry
  ) {}

  onApplicationBootstrap(): void {
    const providers = this.discovery.getProviders().filter(w => {
      // class-based, instantiated providers only
      return !!w.instance && w.metatype && typeof w.metatype === "function";
    });

    const allNames = this.registry.names();
    if (allNames.length === 0) return;

    for (const wrapper of providers) {
      const instance = wrapper.instance as object;
      const ctor = wrapper.metatype as Function;

      // Gather class-level metadata
      const classMW = (Reflect.getMetadata(META_KEYS.CLASS_USE, ctor) as MiddlewareFn[] | undefined) ?? [];
      let scopes = (Reflect.getMetadata(META_KEYS.SCOPES, ctor) as string[] | undefined) ?? ([] as string[]);

      // Default scope: if exactly one bot registered and no explicit scopes, bind to that one
      if (scopes.length === 0 && allNames.length === 1) {
        scopes = allNames;
      }
      // If still empty, bind to all
      if (scopes.length === 0) scopes = allNames;

      const commands =
        (Reflect.getMetadata(META_KEYS.COMMANDS, ctor) as Array<{ method: string; command: string }> | undefined) ?? [];
      const hears =
        (Reflect.getMetadata(META_KEYS.HEARS, ctor) as
          | Array<{ method: string; trigger: string | RegExp }>
          | undefined) ?? [];
      const ons =
        (Reflect.getMetadata(META_KEYS.ON, ctor) as Array<{ method: string; filter: string }> | undefined) ?? [];

      // If no decorated methods, skip early
      if (commands.length === 0 && hears.length === 0 && ons.length === 0) continue;

      // Iterate instance methods
      const proto = Object.getPrototypeOf(instance);
      const methodNames = Object.getOwnPropertyNames(proto).filter(n => n !== "constructor");

      for (const name of methodNames) {
        const desc = Object.getOwnPropertyDescriptor(proto, name);
        if (!desc || typeof desc.value !== "function") continue;

        // Collect method-level metadata
        const methodMW =
          (Reflect.getMetadata(META_KEYS.METHOD_USE, instance, name) as MiddlewareFn[] | undefined) ?? [];

        // Select decorators targeting this method
        const cmds = commands.filter(x => x.method === name);
        const hrs = hears.filter(x => x.method === name);
        const onsx = ons.filter(x => x.method === name);

        if (cmds.length === 0 && hrs.length === 0 && onsx.length === 0) continue;

        // Compose final handler: class @Use -> method @Use -> handler
        const handler = desc.value.bind(instance) as MiddlewareFn;
        const composed = compose([...classMW, ...methodMW], handler);

        // Bind to each scoped bot
        for (const botName of scopes) {
          const entry = this.registry.get(botName) as BotEntry | undefined;
          if (!entry) continue;

          const bindKey = `${ctor.name}:${name}:${botName}`;
          if (!this.registry.guardBinding(bindKey)) continue; // already bound

          const bot = entry.bot as Bot;

          for (const c of cmds) bot.command(c.command, composed);
          for (const h of hrs) bot.hears(h.trigger as any, composed);
          for (const o of onsx) bot.on(o.filter as any, composed);
        }
      }
    }
  }
}
