import { Inject } from "@nestjs/common";

import { TG_API, TG_BOT, TG_OPTIONS, TG_WEBHOOK_CALLBACK } from "./bot-tokens";

export const InjectBot = (name: string) => {
  return Inject(TG_BOT(name));
};
export const InjectBotApi = (name: string) => {
  return Inject(TG_API(name));
};
export const InjectWebhookCallback = (name: string) => {
  return Inject(TG_WEBHOOK_CALLBACK(name));
};
export const InjectBotOptions = (name: string) => {
  return Inject(TG_OPTIONS(name));
};
