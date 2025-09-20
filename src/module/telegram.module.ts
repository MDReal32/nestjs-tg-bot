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
import type { Context as GrammyContext } from "grammy";

import { type DynamicModule, Module, type Provider } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";

import { TelegramDecoratorsBinder } from "../binder";
import { TelegramBotsRegistry } from "../registry";
import { TelegramBotRunner } from "../runtime";
import { TG_API, TG_BOT, TG_OPTIONS, TG_WEBHOOK_CALLBACK, makeToken } from "../tokens";
import type { BotInstanceOptions, TelegramModuleAsyncOptions } from "../types";
import { RegistryModule } from "./registry.module";

/**
 * TelegramModule
 *
 * A NestJS DynamicModule that integrates [grammY](https://grammy.dev/) Telegram bots
 * into the NestJS ecosystem. Supports multiple bots, decorator-based handlers, and
 * dependency injection.
 */
@Module({})
export class TelegramModule {
  /**
   * Registers a bot instance synchronously.
   *
   * @typeParam C - Custom grammY context type (defaults to `GrammyContext`).
   *
   * @param options - Configuration for the bot instance.
   *   - `name`: Unique name for this bot.
   *   - `token`: Telegram bot token.
   *   - `mode`: `"auto" | "polling" | "webhook"` (default: `"auto"`).
   *   - `logging`: Enable NestJS logger output.
   *   - `middlewares`, `apiPlugins`, `rateLimit`, etc.
   *
   * @returns A NestJS DynamicModule exposing providers:
   *   - `TG_OPTIONS(name)` → Bot options
   *   - `TG_BOT(name)` → grammY Bot instance
   *   - `TG_API(name)` → grammY API instance
   *   - `TG_WEBHOOK_CALLBACK(name)` → Webhook callback handler
   */
  static forRoot<C extends GrammyContext = GrammyContext>(options: BotInstanceOptions<C>): DynamicModule {
    const name = options.name;
    const ENTRY = makeToken(`TG_ENTRY:${name}`);

    const optionsProvider = {
      provide: TG_OPTIONS(name),
      useValue: options
    };

    // Create and register the bot once, then expose TG_BOT/TG_API/TG_WEBHOOK_CALLBACK off that entry.
    const entryProvider = {
      provide: ENTRY,
      useFactory: async (registry: TelegramBotsRegistry<C>) => {
        const runner = new TelegramBotRunner<C>(options, registry);
        return runner.run(); // returns BotEntry<C>
      },
      inject: [TelegramBotsRegistry]
    };

    const botProvider = {
      provide: TG_BOT(name),
      useFactory: (entry: any) => entry.bot,
      inject: [ENTRY]
    };

    const apiProvider = {
      provide: TG_API(name),
      useFactory: (entry: any) => entry.api,
      inject: [ENTRY]
    };

    const webhookProvider = {
      provide: TG_WEBHOOK_CALLBACK(name),
      useFactory: (entry: any) => entry.callback,
      inject: [ENTRY]
    };

    return {
      module: TelegramModule,
      imports: [RegistryModule, DiscoveryModule],
      providers: [
        // per-bot providers
        optionsProvider,
        entryProvider,
        botProvider,
        apiProvider,
        webhookProvider,
        // binder (binds decorators on bootstrap)
        TelegramDecoratorsBinder
      ],
      exports: [TG_OPTIONS(name), TG_BOT(name), TG_API(name), TG_WEBHOOK_CALLBACK(name)]
    };
  }

  /**
   * Registers a bot instance asynchronously.
   *
   * Useful when bot configuration depends on async providers
   * (e.g., ConfigService, external secrets).
   *
   * @typeParam C - Custom grammY context type (defaults to `GrammyContext`).
   *
   * @param asyncOptions - Async configuration for the bot.
   *   - `name`: Unique name for this bot.
   *   - `useFactory`: Factory returning `BotInstanceOptions<C>`.
   *   - `imports`: Additional NestJS modules to import.
   *
   * @returns A NestJS DynamicModule exposing the same providers as `forRoot`.
   */
  static forRootAsync<C extends GrammyContext = GrammyContext>(
    asyncOptions: TelegramModuleAsyncOptions<C>
  ): DynamicModule {
    const name = asyncOptions.name;
    const ENTRY = makeToken(`TG_ENTRY:${name}`);

    const asyncOptionsProvider: Provider = {
      provide: TG_OPTIONS(name),
      useFactory: async (...deps: readonly unknown[]) => asyncOptions.useFactory(...deps)
    };

    const entryProvider = {
      provide: ENTRY,
      useFactory: async (registry: TelegramBotsRegistry<C>, opts: BotInstanceOptions<C>) => {
        const runner = new TelegramBotRunner<C>(opts, registry);
        return runner.run();
      },
      inject: [TelegramBotsRegistry, TG_OPTIONS(name)]
    };

    const botProvider = {
      provide: TG_BOT(name),
      useFactory: (entry: any) => entry.bot,
      inject: [ENTRY]
    };

    const apiProvider = {
      provide: TG_API(name),
      useFactory: (entry: any) => entry.api,
      inject: [ENTRY]
    };

    const webhookProvider = {
      provide: TG_WEBHOOK_CALLBACK(name),
      useFactory: (entry: any) => entry.callback,
      inject: [ENTRY]
    };

    return {
      module: TelegramModule,
      imports: [RegistryModule, DiscoveryModule, ...(asyncOptions.imports ?? [])],
      providers: [
        asyncOptionsProvider,
        entryProvider,
        botProvider,
        apiProvider,
        webhookProvider,
        TelegramDecoratorsBinder
      ],
      exports: [TG_OPTIONS(name), TG_BOT(name), TG_API(name), TG_WEBHOOK_CALLBACK(name)]
    };
  }
}
