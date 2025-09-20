import { type Api, Bot, type Context as GrammyContext, webhookCallback } from "grammy";

import { makeLogger } from "../logging/logger";
import { makeRateLimit } from "../rate-limit/make-rate-limit";
import type { BotEntry, HttpWebhookCallback, TelegramBotsRegistry } from "../registry";
import type { BotInstanceOptions } from "../types";
import { type RunnerMode, resolveMode } from "./resolve-mode";

export class TelegramBotRunner<C extends GrammyContext = GrammyContext> {
  private readonly opts: BotInstanceOptions<C>;
  private readonly registry: TelegramBotsRegistry<C>;
  private readonly logger = makeLogger(TelegramBotRunner.name);

  private bot!: Bot<C>;
  private mode!: RunnerMode;
  private callback?: HttpWebhookCallback;

  constructor(opts: BotInstanceOptions<C>, registry: TelegramBotsRegistry<C>) {
    if (!opts?.name) throw new Error("telegram: 'name' is required");
    if (!opts?.token) throw new Error(`telegram: token is required for "${opts?.name}"`);
    if (registry.has(opts.name)) throw new Error(`telegram: bot "${opts.name}" already exists`);

    this.opts = opts;
    this.registry = registry;
    this.logger = makeLogger(opts.name, opts.logging);
  }

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

  async stop(onStopped?: (info: { readonly name: string }) => void): Promise<void> {
    try {
      await this.bot.stop();
      onStopped?.({ name: this.opts.name });
      this.logger.log("Stopped");
    } catch {
      this.logger.warn?.("Stop encountered an error (ignored)");
    }
  }

  private prepare(): void {
    this.bot = new Bot<C>(this.opts.token);

    // API plugins
    for (const plug of this.opts.apiPlugins ?? []) plug(this.bot.api as unknown as Api);

    // Rate limit first, then user middlewares
    const rl = makeRateLimit<C>(this.opts.rateLimit);
    if (rl) this.bot.use(rl);
    for (const mw of this.opts.middlewares ?? []) this.bot.use(mw);

    // Error boundary
    this.bot.catch(err => {
      if (this.opts.onError) return this.opts.onError(err.error, err.ctx as C);
      const e = err.error as unknown as Error | undefined;
      this.logger.error(e?.message ?? "Unhandled bot error", e?.stack);
    });

    this.mode = resolveMode(this.opts);
  }

  private async startPolling(): Promise<void> {
    await this.bot.start({
      ...(this.opts.polling ?? {}),
      onStart: () => {
        this.logger.log("Polling started");
        this.opts.onStart?.({ name: this.opts.name, mode: "polling" });
      }
    });
  }

  private async prepareWebhook(): Promise<void> {
    this.callback = webhookCallback(this.bot, "http");

    const url = this.opts.webhook?.url;
    if (url) {
      const { url: _url, ...rest } = this.opts.webhook!;
      await this.bot.api.setWebhook(url, rest);
    }

    this.logger.log("Webhook ready");
    this.opts.onStart?.({ name: this.opts.name, mode: "webhook" });
  }
}
