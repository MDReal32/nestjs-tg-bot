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
import { type Api, Bot, type Context as GrammyContext, webhookCallback } from "grammy";

import { makeLogger } from "../logging/logger";
import { makeRateLimit } from "../rate-limit/make-rate-limit";
import type { BotEntry, HttpWebhookCallback, TelegramBotsRegistry } from "../registry";
import type { BotInstanceOptions } from "../types";
import { type RunnerMode, resolveMode } from "./resolve-mode";

/**
 * `TelegramBotRunner`
 *
 * Manages the full lifecycle of a single Telegram bot instance:
 * - Initializes the bot with options, API plugins, and middlewares
 * - Handles error boundaries
 * - Starts either **polling** or **webhook** mode
 * - Registers the bot in the `TelegramBotsRegistry`
 * - Provides a `stop()` method for graceful shutdown
 *
 * This class is created internally by the `TelegramModule` during
 * `forRoot` or `forRootAsync`.
 *
 * @typeParam C - The grammY context type.
 */
export class TelegramBotRunner<C extends GrammyContext = GrammyContext> {
  private readonly opts: BotInstanceOptions<C>;
  private readonly registry: TelegramBotsRegistry<C>;
  private readonly logger = makeLogger(TelegramBotRunner.name);

  private bot!: Bot<C>;
  private mode!: RunnerMode;
  private callback?: HttpWebhookCallback;

  /**
   * Create a new bot runner.
   *
   * @param opts - The bot instance options (name, token, plugins, etc.)
   * @param registry - The global registry to store this bot under its name.
   *
   * @throws If `name` or `token` are missing, or if the bot name already exists.
   */
  constructor(opts: BotInstanceOptions<C>, registry: TelegramBotsRegistry<C>) {
    if (!opts?.name) throw new Error("telegram: 'name' is required");
    if (!opts?.token) {
      throw new Error(`telegram: token is required for "${opts?.name}"`);
    }
    if (registry.has(opts.name)) {
      throw new Error(`telegram: bot "${opts.name}" already exists`);
    }

    this.opts = opts;
    this.registry = registry;
    this.logger = makeLogger(opts.name, opts.logging);
  }

  /**
   * Run the bot:
   * - Prepares bot instance, applies plugins & middlewares
   * - Starts in polling or webhook mode
   * - Registers the bot entry in the registry
   *
   * @returns The frozen `BotEntry` for this bot.
   */
  async run(): Promise<BotEntry<C>> {
    this.prepare();

    if (this.mode === "polling") {
      await this.startPolling();
    } else {
      await this.prepareWebhook();
    }

    const entry: BotEntry<C> = Object.freeze({
      bot: this.bot,
      api: this.bot.api as unknown as Api,
      callback: this.callback,
      options: Object.freeze({ ...this.opts })
    });

    this.registry.set(this.opts.name, entry);
    return entry;
  }

  /**
   * Stop the bot gracefully.
   *
   * @param onStopped - Optional callback invoked after stop completes.
   */
  async stop(onStopped?: (info: { readonly name: string }) => void): Promise<void> {
    try {
      await this.bot.stop();
      onStopped?.({ name: this.opts.name });
      this.logger.log("Stopped");
    } catch {
      this.logger.warn?.("Stop encountered an error (ignored)");
    }
  }

  /** Prepare the bot instance, plugins, middlewares, and error handling. */
  private prepare(): void {
    this.bot = new Bot<C>(this.opts.token);

    // Apply API plugins
    for (const plug of this.opts.apiPlugins ?? []) {
      plug(this.bot.api as unknown as Api);
    }

    // Apply rate limiter first, then user middlewares
    const rl = makeRateLimit<C>(this.opts.rateLimit);
    if (rl) this.bot.use(rl);
    for (const mw of this.opts.middlewares ?? []) this.bot.use(mw);

    // Global error boundary
    this.bot.catch(err => {
      if (this.opts.onError) {
        return this.opts.onError(err.error, err.ctx as C);
      }
      const e = err.error as unknown as Error | undefined;
      this.logger.error(e?.message ?? "Unhandled bot error", e?.stack);
    });

    this.mode = resolveMode(this.opts);
  }

  /** Start the bot in long-polling mode. */
  private async startPolling(): Promise<void> {
    await this.bot.start({
      ...(this.opts.polling ?? {}),
      onStart: () => {
        this.logger.log("Polling started");
        this.opts.onStart?.({
          name: this.opts.name,
          mode: "polling"
        });
      }
    });
  }

  /** Prepare the bot in webhook mode (setWebhook + callback). */
  private async prepareWebhook(): Promise<void> {
    this.callback = webhookCallback(this.bot, "http");

    const url = this.opts.webhook?.url;
    if (url) {
      const { url: _url, ...rest } = this.opts.webhook!;
      await this.bot.api.setWebhook(url, rest);
    }

    this.logger.log("Webhook ready");
    this.opts.onStart?.({
      name: this.opts.name,
      mode: "webhook"
    });
  }
}
