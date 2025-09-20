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
import { Command } from "./command";

/**
 * `@Start` decorator
 *
 * Shorthand for `@Command("start")`.
 * Used to register a handler for the `/start` command.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class BotHandlers {
 *   @Start()
 *   async onStart(ctx: Context) {
 *     await ctx.reply("Welcome to the bot!");
 *   }
 * }
 * ```
 */
export const Start = () => Command("start");

/**
 * `@Help` decorator
 *
 * Shorthand for `@Command("help")`.
 * Used to register a handler for the `/help` command.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class BotHandlers {
 *   @Help()
 *   async onHelp(ctx: Context) {
 *     await ctx.reply("Here are the available commands: ...");
 *   }
 * }
 * ```
 */
export const Help = () => Command("help");
