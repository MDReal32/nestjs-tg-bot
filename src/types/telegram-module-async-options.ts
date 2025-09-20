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

import type { Type } from "@nestjs/common";

import type { BotInstanceOptions } from "./bot-instance-options";

/**
 * Async options for registering a bot with `TelegramModule.forRootAsync`.
 *
 * Supports factory-based configuration with dependency injection,
 * useful when options depend on values from a config service, env service,
 * or other NestJS providers.
 *
 * @typeParam C - The grammY context type.
 */
export interface TelegramModuleAsyncOptions<C extends GrammyContext = GrammyContext> {
  /**
   * Unique bot name.
   *
   * Each async registration must provide its own name.
   */
  readonly name: string;

  /**
   * A factory function returning the bot options.
   *
   * May return either:
   * - `BotInstanceOptions` directly
   * - A `Promise<BotInstanceOptions>` for async resolution
   *
   * @example
   * ```ts
   * TelegramModule.forRootAsync({
   *   name: "mybot",
   *   useFactory: async (config: ConfigService) => ({
   *     name: "mybot",
   *     token: config.get("TELEGRAM_TOKEN"),
   *     logging: true,
   *   }),
   *   inject: [ConfigService],
   * })
   * ```
   */
  readonly useFactory: (...deps: readonly unknown[]) => Promise<BotInstanceOptions<C>> | BotInstanceOptions<C>;

  /**
   * Providers to inject into `useFactory`.
   *
   * Works the same as `@Module({ providers })` injection tokens.
   */
  readonly inject?: readonly Type[];

  /**
   * Additional modules to import when resolving the factory.
   *
   * Useful if the factory depends on services from other modules.
   */
  readonly imports?: Type[];
}
