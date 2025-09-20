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
 * Dynamic module — can be imported multiple times.
 * Each call must provide a unique `options.name`.
 */
@Module({})
export class TelegramModule {
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
