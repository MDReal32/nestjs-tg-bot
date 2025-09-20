import { makeToken } from "./token.js";

export const TG_OPTIONS = (name: string) => makeToken(`TG_OPTIONS:${name}`);
export const TG_BOT = (name: string) => makeToken(`TG_BOT:${name}`);
export const TG_API = (name: string) => makeToken(`TG_API:${name}`);
export const TG_WEBHOOK_CALLBACK = (name: string) => makeToken(`TG_WEBHOOK_CALLBACK:${name}`);
