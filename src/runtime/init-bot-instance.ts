import type { Context as GrammyContext } from "grammy";

import type { BotEntry, TelegramBotsRegistry } from "../registry";
import type { BotInstanceOptions } from "../types";
import { TelegramBotRunner } from "./bot-runner";

/** Backward-compatible facade: one line to run, one line to stop. */
export const initBotInstance = <C extends GrammyContext = GrammyContext>(
  opts: BotInstanceOptions<C>,
  registry: TelegramBotsRegistry<C>
): Promise<BotEntry<C>> => new TelegramBotRunner<C>(opts, registry).run();

export const stopBotInstance = async <C extends GrammyContext = GrammyContext>(
  entry: BotEntry<C>,
  name: string,
  onStopped?: (info: { readonly name: string }) => void
): Promise<void> => {
  try {
    await entry.bot.stop();
    onStopped?.({ name });
  } catch {}
};
