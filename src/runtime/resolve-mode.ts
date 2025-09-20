import type { Context as GrammyContext } from "grammy";

import type { BotInstanceOptions } from "../types";

export type RunnerMode = NonNullable<Exclude<BotInstanceOptions["mode"], "auto">>;

export const resolveMode = <C extends GrammyContext>(opts: BotInstanceOptions<C>): RunnerMode => {
  const m = opts.mode ?? "auto";
  return m === "auto" ? (opts.webhook?.url ? "webhook" : "polling") : m;
};
