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
import { META_KEYS } from "./meta-keys";

/**
 * `@Conversation` decorator
 *
 * Marks a method as a grammY conversation handler.
 * Requires `@grammyjs/conversations` to be installed as a peer dependency.
 *
 * The `conversations()` middleware and `createConversation()` are applied
 * automatically at bootstrap — no manual bot setup needed.
 *
 * @example
 * ```ts
 * import type { Conversation, ConversationFlavor } from "@grammyjs/conversations";
 * import type { Context } from "grammy";
 *
 * type MyContext = ConversationFlavor<Context>;
 *
 * @Injectable()
 * export class BotHandlers {
 *   @Start()
 *   async onStart(ctx: MyContext) {
 *     await ctx.conversation.enter("collect");
 *   }
 *
 *   @Conversation("collect")
 *   async collect(conversation: Conversation<MyContext>, ctx: MyContext) {
 *     await ctx.reply("What is your name?");
 *     const { message } = await conversation.waitFor("message:text");
 *     await ctx.reply(`Hello, ${message.text}!`);
 *   }
 * }
 * ```
 *
 * @param name - Conversation identifier used with `ctx.conversation.enter(name)`.
 *               Defaults to the method name if omitted.
 */
export const Conversation = (name?: string) => (target: object, propertyKey: string | symbol) => {
  const ctor = (target as any).constructor ?? target;
  const convName = name ?? (propertyKey as string);

  const conversations = (Reflect.getMetadata(META_KEYS.CONVERSATIONS, ctor) as any[] | undefined) ?? [];
  conversations.push({ method: propertyKey, name: convName });
  Reflect.defineMetadata(META_KEYS.CONVERSATIONS, conversations, ctor);
};
