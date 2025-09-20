export type Token = string & { readonly __brand: "TelegramModuleToken" };
export const makeToken = (s: string): Token => s as Token;
