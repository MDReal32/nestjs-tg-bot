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
 * `@On` decorator
 *
 * Registers a handler for raw [grammY filters](https://grammy.dev/guide/filters.html),
 * such as `"message:text"`, `"callback_query:data"`, or any other event string.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class BotHandlers {
 *   @On("message:text")
 *   async onText(ctx: Context) {
 *     await ctx.reply(`You said: ${ctx.message.text}`);
 *   }
 *
 *   @On("callback_query:data")
 *   async onCallback(ctx: Context) {
 *     await ctx.answerCallbackQuery("Got it!");
 *   }
 * }
 * ```
 *
 * @param filter - grammY filter string (e.g. `"message:text"`).
 * @returns Method decorator storing metadata for `TelegramDecoratorsBinder`.
 */
export const On = (filter: string) => (target: object, propertyKey: string | symbol) => {
  const ctor = (target as any).constructor ?? target;

  // Collect existing @On metadata for this class
  const list = (Reflect.getMetadata(META_KEYS.ON, ctor) as any[] | undefined) ?? [];

  // Register new event mapping
  list.push({ method: propertyKey, filter });

  Reflect.defineMetadata(META_KEYS.ON, list, ctor);
};
