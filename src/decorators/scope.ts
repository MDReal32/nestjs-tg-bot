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
import { META_KEYS } from "./meta-keys";

/**
 * `@Scope` decorator
 *
 * Restricts a provider (e.g. a handler class) to a **single bot instance**.
 * Useful when your application registers multiple bots and you want
 * to bind a provider only to one of them.
 *
 * @example
 * ```ts
 * @Injectable()
 * @Scope("alpha")
 * export class AlphaBotHandlers {
 *   @Command("ping")
 *   async onPing(ctx: Context) {
 *     await ctx.reply("pong from alpha");
 *   }
 * }
 * ```
 *
 * @param name - The unique name of the bot this provider is bound to.
 */
export const Scope =
  (name: string): ClassDecorator =>
  target =>
    Reflect.defineMetadata(META_KEYS.SCOPES, [name], target);

/**
 * `@Scopes` decorator
 *
 * Restricts a provider to multiple bot instances.
 * Useful when the same provider should handle commands for several bots,
 * but not all bots in the application.
 *
 * @example
 * ```ts
 * @Injectable()
 * @Scopes(["alpha", "beta"])
 * export class MultiBotHandlers {
 *   @Command("status")
 *   async onStatus(ctx: Context) {
 *     await ctx.reply("status checked");
 *   }
 * }
 * ```
 *
 * @param names - The list of bot names this provider is bound to.
 */
export const Scopes =
  (names: readonly string[]): ClassDecorator =>
  target =>
    Reflect.defineMetadata(META_KEYS.SCOPES, [...names], target);
