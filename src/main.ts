import "reflect-metadata";

// Core module
export { TelegramModule } from "./module/telegram.module";

// Handler decorators
export { Command, Conversation, Start, Help, Hears, On, Use, Scope, Scopes } from "./decorators";

// Injection decorators
export { InjectBot, InjectApi, InjectWebhook, InjectOptions } from "./tokens";

// Public types
export type { BotInstanceOptions, TelegramMiddleware, TelegramModuleAsyncOptions, WebhookOptions } from "./types";
