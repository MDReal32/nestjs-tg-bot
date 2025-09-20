import type { Context as GrammyContext } from "grammy";

import type { Type } from "@nestjs/common";

import type { BotInstanceOptions } from "./bot-instance-options";

export interface TelegramModuleAsyncOptions<C extends GrammyContext = GrammyContext> {
  readonly name: string;
  readonly useFactory: (...deps: readonly unknown[]) => Promise<BotInstanceOptions<C>> | BotInstanceOptions<C>;
  readonly inject?: readonly Type[];
  readonly imports?: Type[];
}
