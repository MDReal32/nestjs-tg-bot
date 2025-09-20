# @mdreal/nestjs-tg-bot

[![npm version](https://img.shields.io/npm/v/@mdreal/nestjs-tg-bot)](https://www.npmjs.com/package/@mdreal/nestjs-tg-bot)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](./LICENSE)
[![Downloads](https://img.shields.io/npm/dw/@mdreal/nestjs-tg-bot)](https://www.npmjs.com/package/@mdreal/nestjs-tg-bot)

**A fully-typed, decorator-driven [NestJS](https://nestjs.com) module for building Telegram bots with [grammY](https://grammy.dev/).**

This package provides a clean, modular approach to integrating grammY bots into your NestJS applications. It is designed for developers who value **SOLID principles**, **KISS design**, and first-class TypeScript support.

---

## ✨ Highlights

* **Dynamic NestJS Module**
  Easily register one or multiple Telegram bots with `TelegramModule.forRoot()` / `forRootAsync()`.

* **Multiple Bots in One App**
  Run any number of bots in a single NestJS instance. Each bot has a unique name and isolated scope.

* **Decorator-based API**
  Write expressive and concise handlers with decorators:

  * `@Command("...")`, `@Hears("...")`, `@On("...")`, `@Use()`
  * Shorthands: `@Start()`, `@Help()`

* **Scoped Handlers**
  `@Scope("botName")` / `@Scopes([...])` let you control which bot executes which handler.

* **Elegant Dependency Injection**
  Inject instances directly into services:

  * `@InjectBot("name")`
  * `@InjectApi("name")`
  * `@InjectWebhook("name")`
  * `@InjectOptions("name")`

* **Nest-style Integration**
  Uses Nest’s `DiscoveryService` to auto-wire handlers at bootstrap. No manual plumbing required.

* **Flexible Runtime**
  Choose between **polling** or **webhook** mode per bot. Supports grammY plugins, middlewares, logging, and rate limiting.

---

## 📦 Installation

```bash
pnpm add @mdreal/nestjs-tg-bot
# peer dependencies (required in your app)
pnpm add @nestjs/common @nestjs/core reflect-metadata
```

---

## 🚀 Getting Started

### Single Bot Setup

```ts
import { Module } from "@nestjs/common";
import { TelegramModule } from "@mdreal/nestjs-tg-bot";

@Module({
  imports: [
    TelegramModule.forRoot({
      name: "mybot",
      token: process.env.TELEGRAM_TOKEN!,
      mode: "auto",   // "auto" | "polling" | "webhook"
      logging: true,  // use NestJS logger
    }),
  ],
})
export class AppModule {}
```

### Basic Handler

```ts
import { Injectable } from "@nestjs/common";
import { Start, Help } from "@mdreal/nestjs-tg-bot";
import type { Context } from "grammy";

@Injectable()
export class BotHandlers {
  @Start()
  async onStart(ctx: Context) {
    await ctx.reply("Welcome to the bot!");
  }

  @Help()
  async onHelp(ctx: Context) {
    await ctx.reply("Available commands: /start, /help");
  }
}
```

---

## 🤖 Multiple Bots Example

```ts
@Module({
  imports: [
    TelegramModule.forRoot({ name: "alpha", token: process.env.TG_ALPHA! }),
    TelegramModule.forRoot({ name: "beta", token: process.env.TG_BETA! }),
  ],
})
export class AppModule {}

import { Injectable } from "@nestjs/common";
import { Scope, Command } from "@mdreal/nestjs-tg-bot";
import type { Context } from "grammy";

@Injectable()
@Scope("beta") // binds only to the "beta" bot
export class BetaHandlers {
  @Command("ping")
  async onPing(ctx: Context) {
    await ctx.reply("pong from beta bot");
  }
}
```

---

## 💉 Dependency Injection

```ts
import { Injectable } from "@nestjs/common";
import { InjectBot, InjectApi } from "@mdreal/nestjs-tg-bot";
import type { Bot, Api } from "grammy";

@Injectable()
export class BotService {
  constructor(
    @InjectBot("mybot") private readonly bot: Bot,
    @InjectApi("mybot") private readonly api: Api,
  ) {}

  async notify(chatId: number, message: string) {
    await this.api.sendMessage(chatId, message);
  }
}
```

---

## ⚙️ Configuration Options

```ts
TelegramModule.forRoot({
  name: "mybot",
  token: "...",
  mode: "auto" | "polling" | "webhook",
  apiPlugins: [],      // register grammY API plugins
  rateLimit: {},       // in-memory rate limiting
  middlewares: [],     // custom grammY middlewares
  polling: {},         // PollingOptions
  webhook: { url: ""}, // WebhookOptions
  logging: true,       // enable NestJS logger
  onError: (err) => {}, 
  onStart: (info) => {},
});
```

---

## 🧭 Roadmap

### ✅ Implemented

* Core decorators: `@Command`, `@Start`, `@Help`, `@Hears`, `@On`, `@Use`
* Multi-bot support with `@Scope` / `@Scopes`
* Injection helpers: `@InjectBot`, `@InjectApi`, `@InjectWebhook`, `@InjectOptions`
* Auto-binding via `DiscoveryService`

### 🚧 Planned Built-ins

* `@AdminOnly()` — restricts handlers to configured admin user IDs
* `@PrivateChat()` / `@GroupChat()` — run handlers only in specific chat types
* `@Throttle(ms)` — simple per-user throttling for spam control
* `@Alias("...")` — define multiple triggers for the same command
* `@Fallback()` — catch-all handler for unrecognized input
* `@InlineQuery()` — shorthand for inline query events
* `@ChosenInlineResult()` — shorthand for chosen inline results
* `@CallbackQuery("...")` — decorator for handling button callbacks
* Auto-generated `/help` command that aggregates available commands

### 🛠 Infrastructure

* CLI generator: `nest g handler` for scaffolded handlers with decorators
* Graceful shutdown hooks (`bot.stop()` integration with Nest lifecycle)
* Example starter projects (REST + bot hybrid apps)

---

## 📖 Documentation & References

* [grammY Documentation](https://grammy.dev/) — for bot API & middleware
* [NestJS Documentation](https://docs.nestjs.com/) — for framework fundamentals

This library bridges the two worlds: **ergonomics of grammY** inside the **structured environment of NestJS**.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome.
Please open an issue to discuss ideas before submitting PRs.

---

## 📄 License

Licensed under the [Apache License 2.0](./LICENSE).  
Copyright © 2025 [MDReal](https://github.com/mdreal)