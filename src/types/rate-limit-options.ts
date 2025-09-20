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

/**
 * Options for the in-memory rate limiter middleware.
 *
 * Used in `BotInstanceOptions.rateLimit` and applied before
 * all user-defined middlewares.
 *
 * ⚠️ This implementation is **per-process only**.
 * For distributed systems, consider an external rate limiter.
 *
 * @typeParam C - The grammY context type.
 */
export interface RateLimitOptions<C extends GrammyContext = GrammyContext> {
  /**
   * Whether rate limiting is enabled.
   *
   * Defaults to `false` if not provided.
   */
  readonly enabled?: boolean;

  /**
   * Time window in milliseconds before counters reset.
   *
   * Defaults to `10_000` (10 seconds).
   */
  readonly windowMs?: number;

  /**
   * Maximum number of allowed actions per window per key.
   *
   * Defaults to `20`.
   */
  readonly max?: number;

  /**
   * Function used to extract the rate limit key from context.
   *
   * Defaults to `ctx.from.id` or `"anon"` if unavailable.
   *
   * @example
   * ```ts
   * key: ctx => `chat:${ctx.chat?.id}`
   * ```
   */
  readonly key?: (ctx: C) => string;
}
