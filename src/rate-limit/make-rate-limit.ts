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

import type { RateLimitOptions } from "../types";

/**
 * `makeRateLimit`
 *
 * Creates an **in-memory, soft-drop rate limiter** middleware for grammY.
 *
 * - Uses a simple sliding window counter per user.
 * - If the limit is exceeded, requests are silently dropped (no error).
 * - Useful for basic protection against spam without external dependencies.
 *
 * ⚠️ Not recommended for distributed or clustered deployments,
 * since the in-memory store is per-process only.
 *
 * @example
 * ```ts
 * bot.use(makeRateLimit({
 *   enabled: true,
 *   windowMs: 10_000,
 *   max: 5,
 *   key: ctx => String(ctx.from?.id)
 * }));
 * ```
 *
 * @param opts - Rate limiting configuration.
 * @returns A `MiddlewareFn` if enabled, otherwise `undefined`.
 */
export const makeRateLimit = <C extends GrammyContext = GrammyContext>(
  opts?: RateLimitOptions<C>
): MiddlewareFn<C> | undefined => {
  if (!opts?.enabled) return undefined;

  const windowMs = opts.windowMs ?? 10_000;
  const max = opts.max ?? 20;
  const keyFn = opts.key ?? ((ctx: C) => String((ctx as any)?.from?.id ?? "anon"));

  const hits = new Map<string, { count: number; reset: number }>();

  return async (ctx, next) => {
    const key = keyFn(ctx);
    const now = Date.now();

    const entry = hits.get(key) ?? { count: 0, reset: now + windowMs };

    if (now > entry.reset) {
      entry.count = 0;
      entry.reset = now + windowMs;
    }

    entry.count += 1;
    hits.set(key, entry);

    if (entry.count > max) return; // soft-drop
    await next();
  };
};
