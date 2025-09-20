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
import { Inject } from "@nestjs/common";

import { TG_API, TG_BOT, TG_OPTIONS, TG_WEBHOOK_CALLBACK } from "./bot-tokens";

/**
 * Injects the grammY `Bot` instance for a given bot name.
 *
 * @example
 * ```ts
 * constructor(@InjectBot("mybot") private readonly bot: Bot) {}
 * ```
 *
 * @param name - The unique bot name.
 */
export const InjectBot = (name: string) => Inject(TG_BOT(name));

/**
 * Injects the grammY `Api` client for a given bot name.
 *
 * @example
 * ```ts
 * constructor(@InjectApi("mybot") private readonly api: Api) {}
 * ```
 *
 * @param name - The unique bot name.
 */
export const InjectApi = (name: string) => Inject(TG_API(name));

/**
 * Injects the HTTP webhook callback for a given bot name.
 *
 * Useful if you want to mount the bot’s webhook into a NestJS
 * or raw HTTP server route manually.
 *
 * @example
 * ```ts
 * constructor(@InjectWebhook("mybot") private readonly callback: HttpWebhookCallback) {}
 * ```
 *
 * @param name - The unique bot name.
 */
export const InjectWebhook = (name: string) => Inject(TG_WEBHOOK_CALLBACK(name));

/**
 * Injects the raw `BotInstanceOptions` used to configure the bot.
 *
 * @example
 * ```ts
 * constructor(@InjectOptions("mybot") private readonly opts: BotInstanceOptions) {}
 * ```
 *
 * @param name - The unique bot name.
 */
export const InjectOptions = (name: string) => Inject(TG_OPTIONS(name));
