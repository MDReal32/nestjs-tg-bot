import { TelegramModule } from "@mdreal/nestjs-tg-bot";
import { Module } from "@nestjs/common";

import { BotHandler } from "./bot.handler";

@Module({
  imports: [
    TelegramModule.forRoot({
      name: "mybot",
      token: process.env.TELEGRAM_BOT_TOKEN ?? "",
      mode: "auto", // "auto" | "polling" | "webhook"
      logging: true // use NestJS logger
    })
  ],
  providers: [BotHandler]
})
export class AppModule {}
