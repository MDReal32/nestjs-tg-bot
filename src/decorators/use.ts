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
import type { Context as GrammyContext, MiddlewareFn } from "grammy";

import { META_KEYS } from "./meta-keys";

/**
 * `@Use` decorator
 *
 * Registers one or more grammY middlewares.
 * Can be applied **at class level** (all handlers in the class)
 * or **method level** (only that handler).
 *
 * @example
 * ```ts
 * @Injectable()
 * @Use(loggingMiddleware)
 * export class BotHandlers {
 *   @Command("secret")
 *   @Use(authMiddleware)
 *   async onSecret(ctx: Context) {
 *     await ctx.reply("This is protected");
 *   }
 * }
 * ```
 *
 * @typeParam C - Custom grammY context type (defaults to `GrammyContext`).
 * @param middlewares - One or more grammY middlewares.
 * @returns Class or method decorator storing metadata for `TelegramDecoratorsBinder`.
 */
export const Use =
  <C extends GrammyContext = GrammyContext>(...middlewares: readonly MiddlewareFn<C>[]) =>
  (target: object, propertyKey?: string | symbol) => {
    if (propertyKey !== undefined) {
      // Method-level middlewares
      const list =
        (Reflect.getMetadata(META_KEYS.METHOD_USE, target, propertyKey) as MiddlewareFn<C>[] | undefined) ?? [];
      Reflect.defineMetadata(META_KEYS.METHOD_USE, [...list, ...middlewares], target, propertyKey);
    } else {
      // Class-level middlewares
      const ctor = target as Function;
      const list = (Reflect.getMetadata(META_KEYS.CLASS_USE, ctor) as MiddlewareFn<C>[] | undefined) ?? [];
      Reflect.defineMetadata(META_KEYS.CLASS_USE, [...list, ...middlewares], ctor);
    }
  };
