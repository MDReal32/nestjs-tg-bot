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
import type { Api, Bot, Context as GrammyContext } from "grammy";

import type { BotInstanceOptions } from "../types";

/**
 * `BotEntry`
 *
 * Represents a stored entry in the registry for each named bot instance.
 * Each bot is registered under a unique name and includes:
 *
 * - The `Bot` instance itself
 * - The corresponding grammY `Api` client
 * - An optional platform-specific webhook callback
 * - The frozen configuration options used to initialize the bot
 *
 * This is the unit stored and retrieved in the `TelegramBotsRegistry`.
 *
 * @typeParam C - The grammY context type.
 * @typeParam CB - The webhook callback type (platform-specific).
 */
export interface BotEntry<C extends GrammyContext = GrammyContext, CB = unknown> {
  /** The grammY `Bot` instance for this named bot. */
  readonly bot: Bot<C>;

  /** The grammY `Api` client bound to this bot's token. */
  readonly api: Api;

  /**
   * The webhook callback function, if the bot is running in webhook mode.
   *
   * The exact type is platform-specific (e.g. `(req, res) => void` for Node).
   */
  readonly callback?: CB;

  /** The resolved, frozen options that initialized this bot. */
  readonly options: Readonly<BotInstanceOptions<C>>;
}
