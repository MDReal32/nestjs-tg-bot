import type { Api, Context as GrammyContext, MiddlewareFn, PollingOptions } from "grammy";

import type { LoggingOptions } from "./logging-options";
import type { RateLimitOptions } from "./rate-limit-options";
import type { WebhookOptions } from "./webhook-options";

export interface BotInstanceOptions<C extends GrammyContext = GrammyContext> {
  readonly name: string;
  readonly token: string;

  readonly mode?: "auto" | "polling" | "webhook";

  // /** grammY API plugins: bot.api.config.use(...) */
  readonly apiPlugins?: ((api: Api) => void)[];

  /** Optional in-memory rate limiter; applied before user middlewares. */
  readonly rateLimit?: RateLimitOptions<C>;

  /** grammY middlewares; applied after rateLimit. */
  readonly middlewares?: readonly MiddlewareFn<C>[];

  readonly polling?: PollingOptions;
  readonly webhook?: WebhookOptions;

  readonly logging?: boolean | LoggingOptions;
  readonly onError?: (err: unknown, ctx?: C) => void;
  readonly onStart?: (info: { readonly name: string; readonly mode: "polling" | "webhook" }) => void;
}
