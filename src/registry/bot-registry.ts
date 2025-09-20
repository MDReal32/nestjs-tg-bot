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

import type { BotEntry } from "./bot-entry";

/**
 * `TelegramBotsRegistry`
 *
 * A **global, in-memory registry** for managing multiple named bot instances.
 * Each bot is registered once under a unique `name`, and can be retrieved
 * later by other parts of the application.
 *
 * Also tracks decorator bindings (via `guardBinding`) to prevent duplicate
 * handlers from being registered for the same method/bot combination.
 *
 * This is the backbone of multi-bot support in the module.
 *
 * @typeParam C - The grammY context type.
 * @typeParam CB - The webhook callback type (implementation-specific).
 */
export class TelegramBotsRegistry<C extends GrammyContext = GrammyContext, CB = unknown> {
  private readonly map = new Map<string, BotEntry<C, CB>>();
  private readonly boundKeys = new Set<string>();

  /**
   * Register a new bot entry.
   *
   * @param name - Unique bot name.
   * @param entry - The bot entry instance (created by `TelegramBotRunner`).
   * @throws If a bot with the same name already exists.
   */
  set(name: string, entry: BotEntry<C, CB>): void {
    if (this.map.has(name)) {
      throw new Error(`telegram: bot "${name}" already exists`);
    }
    this.map.set(name, entry);
  }

  /**
   * Get a registered bot entry by name.
   *
   * @param name - Bot name.
   * @returns The bot entry, or `undefined` if not found.
   */
  get(name: string): BotEntry<C, CB> | undefined {
    return this.map.get(name);
  }

  /**
   * Check if a bot is registered under the given name.
   *
   * @param name - Bot name.
   * @returns `true` if registered, otherwise `false`.
   */
  has(name: string): boolean {
    return this.map.has(name);
  }

  /**
   * List all registered bot names.
   *
   * @returns An array of bot names.
   */
  names(): string[] {
    return Array.from(this.map.keys());
  }

  /**
   * Guard against duplicate decorator bindings.
   *
   * Used by the `TelegramDecoratorsBinder` to ensure the same
   * method is not bound multiple times to the same bot.
   *
   * @param key - A composite key (`Class:method:botName`).
   * @returns `true` if this is the first time the key is seen,
   *          `false` if it was already bound.
   */
  guardBinding(key: string): boolean {
    if (this.boundKeys.has(key)) return false;
    this.boundKeys.add(key);
    return true;
  }
}
