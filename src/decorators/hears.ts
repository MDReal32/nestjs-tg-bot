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
 * `@Hears` decorator
 *
 * Registers a handler method for messages matching the given trigger.
 * Triggers can be a **string** (exact match) or a **regular expression**.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class BotHandlers {
 *   @Hears("hello")
 *   async onHello(ctx: Context) {
 *     await ctx.reply("Hi there!");
 *   }
 *
 *   @Hears(/bye/i)
 *   async onBye(ctx: Context) {
 *     await ctx.reply("Goodbye!");
 *   }
 * }
 * ```
 *
 * @param trigger - String or RegExp to match incoming messages against.
 * @returns Method decorator storing metadata for `TelegramDecoratorsBinder`.
 */
export const Hears = (trigger: string | RegExp) => (target: object, propertyKey: string | symbol) => {
  const ctor = (target as any).constructor ?? target;

  // Collect existing hears metadata for this class
  const list = (Reflect.getMetadata(META_KEYS.HEARS, ctor) as any[] | undefined) ?? [];

  // Register new hears mapping
  list.push({ method: propertyKey, trigger });

  Reflect.defineMetadata(META_KEYS.HEARS, list, ctor);
};
