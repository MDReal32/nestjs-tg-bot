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
 * `@KeyboardCallbacks` decorator
 *
 * Registers a handler method for callback queries matching the given trigger.
 * Triggers can be a **string** (exact match) or a **regular expression**.
 *
 * @example
 * ```ts
 * @Injectable()
 * export class BotHandlers {
 *   @KeyboardCallbacks("confirm")
 *   async onConfirm(ctx: Context) {
 *     await ctx.answerCallbackQuery("Confirmed!");
 *   }
 *
 *   @KeyboardCallbacks(/delete_.+/)
 *   async onDelete(ctx: Context) {
 *     await ctx.answerCallbackQuery("Deleted!");
 *   }
 * }
 * ```
 *
 * @param trigger - String or RegExp to match incoming callback data against.
 * @returns Method decorator storing metadata for `TelegramDecoratorsBinder`.
 */
export const KeyboardCallback = (trigger: string | RegExp) => (target: object, propertyKey: string | symbol) => {
  const ctor = (target as any).constructor ?? target;

  const callbacks = (Reflect.getMetadata(META_KEYS.KEYBOARD_CALLBACKS, ctor) as any[] | undefined) ?? [];
  callbacks.push({ method: propertyKey, callback: trigger });
  Reflect.defineMetadata(META_KEYS.KEYBOARD_CALLBACKS, callbacks, ctor);
};
