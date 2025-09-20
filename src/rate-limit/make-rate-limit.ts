import type { Context as GrammyContext, MiddlewareFn } from "grammy";

import type { RateLimitOptions } from "../types";

/** In-memory, soft-drop rate limiter (KISS). */
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
