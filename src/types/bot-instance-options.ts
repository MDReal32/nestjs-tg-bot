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
import type { Api, Context as GrammyContext, MiddlewareFn, PollingOptions } from "grammy";

import type { LoggingOptions } from "./logging-options";
import type { RateLimitOptions } from "./rate-limit-options";
import type { WebhookOptions } from "./webhook-options";

/**
 * Configuration options for a single bot instance.
 *
 * Passed to `TelegramModule.forRoot` or `forRootAsync`.
 *
 * @typeParam C - The grammY context type.
 */
export interface BotInstanceOptions<C extends GrammyContext = GrammyContext> {
  /**
   * Unique bot name.
   *
   * Required for multi-bot setups to distinguish between instances.
   */
  readonly name: string;

  /**
   * Bot token from BotFather.
   *
   * Must be valid; required for initialization.
   */
  readonly token: string;

  /**
   * Runtime mode:
   * - `"polling"` → Use long-polling
   * - `"webhook"` → Use webhook callbacks
   * - `"auto"` → Infer from `webhook.url` (default = `"polling"`)
   *
   * Defaults to `"auto"`.
   */
  readonly mode?: "auto" | "polling" | "webhook";

  /**
   * grammY API plugins to configure `bot.api`.
   *
   * Each function receives the API instance and may
   * register configuration or extensions.
   *
   * @example
   * ```ts
   * apiPlugins: [api => api.config.use(loggingPlugin)]
   * ```
   */
  readonly apiPlugins?: ((api: Api) => void)[];

  /**
   * Optional in-memory rate limiter middleware.
   *
   * Applied **before** user middlewares.
   */
  readonly rateLimit?: RateLimitOptions<C>;

  /**
   * Custom grammY middlewares.
   *
   * Applied **after** the rate limiter (if enabled).
   */
  readonly middlewares?: readonly MiddlewareFn<C>[];

  /**
   * Options specific to polling mode.
   */
  readonly polling?: PollingOptions;

  /**
   * Options specific to webhook mode.
   */
  readonly webhook?: WebhookOptions;

  /**
   * Enable or configure per-bot logging.
   *
   * - `true` → enable with defaults (`info` level)
   * - `false` → disable logging
   * - `{ enabled, level }` → fine-grained control
   */
  readonly logging?: boolean | LoggingOptions;

  /**
   * Optional error boundary callback.
   *
   * If provided, called when a middleware or handler throws.
   */
  readonly onError?: (err: unknown, ctx?: C) => void;

  /**
   * Callback triggered when the bot successfully starts.
   *
   * Receives the bot name and mode.
   */
  readonly onStart?: (info: { readonly name: string; readonly mode: "polling" | "webhook" }) => void;
}
