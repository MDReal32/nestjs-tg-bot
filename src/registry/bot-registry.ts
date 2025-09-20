import type { Context as GrammyContext } from "grammy";

import type { BotEntry } from "./bot-entry";

/** Global, in-memory registry for named bots. */
export class TelegramBotsRegistry<C extends GrammyContext = GrammyContext, CB = unknown> {
  private readonly map = new Map<string, BotEntry<C, CB>>();
  private readonly boundKeys = new Set<string>();

  set(name: string, entry: BotEntry<C, CB>): void {
    if (this.map.has(name)) throw new Error(`telegram: bot "${name}" already exists`);
    this.map.set(name, entry);
  }

  get(name: string): BotEntry<C, CB> | undefined {
    return this.map.get(name);
  }

  has(name: string): boolean {
    return this.map.has(name);
  }

  names() {
    return Array.from(this.map.keys());
  }

  guardBinding(key: string): boolean {
    if (this.boundKeys.has(key)) return false;
    this.boundKeys.add(key);
    return true;
  }
}
