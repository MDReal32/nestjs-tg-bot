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
 * `@Command` decorator
 *
 * Registers a handler method for a Telegram `/command`.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class BotHandlers {
 *   @Command("start")
 *   async onStart(ctx: Context) {
 *     await ctx.reply("Hello!");
 *   }
 * }
 * ```
 *
 * @param command - The command string (without `/`).
 * @returns Method decorator that stores metadata for `TelegramDecoratorsBinder`.
 */
export const Command = (command: string) => (target: object, propertyKey: string | symbol) => {
  const ctor = (target as any).constructor ?? target;

  // Collect existing command metadata for this class
  const list = (Reflect.getMetadata(META_KEYS.COMMANDS, ctor) as any[] | undefined) ?? [];

  // Register new command mapping
  list.push({ method: propertyKey, command });

  Reflect.defineMetadata(META_KEYS.COMMANDS, list, ctor);
};
