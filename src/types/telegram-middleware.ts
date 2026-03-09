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
import type { Context, NextFunction } from "grammy";

/**
 * Interface for bot-level middleware providers.
 *
 * Implement this interface in any `@Injectable()` provider and register it
 * via `BotModule.configure(consumer)` to apply it to specific bots.
 *
 * Mirrors the NestJS `NestMiddleware` pattern.
 *
 * @typeParam C - grammY context type (defaults to `Context`).
 *
 * @example
 * ```ts
 * import { Injectable } from "@nestjs/common";
 * import { TelegramMiddleware } from "@mdreal/nestjs-tg-bot";
 * import type { Context, NextFunction } from "grammy";
 *
 * @Injectable()
 * export class LoggingMiddleware implements TelegramMiddleware {
 *   use(ctx: Context, next: NextFunction) {
 *     console.log(`[${ctx.updateType}] from ${ctx.from?.id}`);
 *     return next();
 *   }
 * }
 * ```
 */
export interface TelegramMiddleware<C extends Context = Context> {
  use(ctx: C, next: NextFunction): Promise<void> | void;
}
