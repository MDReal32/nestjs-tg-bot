import { Context, InlineKeyboard } from "grammy";

import { KeyboardCallback, Start } from "@mdreal/nestjs-tg-bot";
import { Injectable } from "@nestjs/common";

@Injectable()
export class BotHandler {
  @Start()
  async start(ctx: Context) {
    const kb = new InlineKeyboard();
    kb.text("Click me!", "click");
    await ctx.reply("Welcome to the bot! Click the button below.", { reply_markup: kb });
  }

  @KeyboardCallback("click")
  async onClick(ctx: Context) {
    await ctx.answerCallbackQuery({ text: "You were curious, indeed!" });
    const data = ctx.callbackQuery?.data;
    console.log(data);
  }
}
