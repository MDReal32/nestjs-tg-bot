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

import type { BotInstanceOptions } from "../types";

/**
 * Allowed runtime modes for a bot.
 * `"auto"` is excluded here since it is resolved internally.
 */
export type RunnerMode = NonNullable<Exclude<BotInstanceOptions["mode"], "auto">>;

/**
 * Resolve the effective bot mode (`"polling"` or `"webhook"`).
 *
 * - If `mode` is explicitly `"polling"` or `"webhook"`, return it directly.
 * - If `mode` is `"auto"` or not set:
 *   - If `webhook.url` is present → `"webhook"`
 *   - Otherwise → `"polling"`
 *
 * @example
 * ```ts
 * resolveMode({ mode: "polling" }) // => "polling"
 * resolveMode({ mode: "auto", webhook: { url: "https://..." } }) // => "webhook"
 * resolveMode({}) // => "polling"
 * ```
 *
 * @param opts - The bot instance options.
 * @returns The resolved runtime mode.
 */
export const resolveMode = <C extends GrammyContext>(opts: BotInstanceOptions<C>): RunnerMode => {
  const m = opts.mode ?? "auto";
  return m === "auto" ? (opts.webhook?.url ? "webhook" : "polling") : m;
};
