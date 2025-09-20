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
import type { RawApi } from "grammy";

/**
 * Extracted type representing the second parameter of `Api["setWebhook"]`,
 * i.e. the allowed options when configuring a Telegram webhook.
 */
type SetWebhookOpts = NonNullable<Parameters<RawApi["setWebhook"]>[0]>;

/**
 * Options for configuring webhook mode.
 *
 * This type is identical to the options accepted by
 * `bot.api.setWebhook(url, options)` in grammY, and is extended here
 * for convenience so it can be passed directly via
 * `BotInstanceOptions.webhook`.
 *
 * Common fields include:
 * - `secret_token?: string`
 * - `max_connections?: number`
 * - `allowed_updates?: string[]`
 *
 * @example
 * ```ts
 * webhook: {
 *   url: "https://example.com/telegram/webhook",
 *   secret_token: "supersecret",
 *   allowed_updates: ["message", "callback_query"],
 * }
 * ```
 */
export interface WebhookOptions extends SetWebhookOpts {}
