import type { Api, Bot, Context as GrammyContext } from "grammy";

import type { BotInstanceOptions } from "../types";

/** Stored entry for each named bot instance. */
export interface BotEntry<C extends GrammyContext = GrammyContext, CB = unknown> {
  readonly bot: Bot<C>;
  readonly api: Api;
  /** Webhook callback (platform-specific signature). */
  readonly callback?: CB;
  /** Frozen, resolved options for this bot instance. */
  readonly options: Readonly<BotInstanceOptions<C>>;
}
