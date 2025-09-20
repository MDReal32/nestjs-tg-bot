import type { Context as GrammyContext } from "grammy";

export interface RateLimitOptions<C extends GrammyContext = GrammyContext> {
  readonly enabled?: boolean;
  readonly windowMs?: number;
  readonly max?: number;
  readonly key?: (ctx: C) => string;
}
