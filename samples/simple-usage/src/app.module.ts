import { TelegramModule } from "@mdreal/nestjs-tg-bot";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    TelegramModule.forRoot({
      name: "mybot",
      token: process.env.TELEGRAM_TOKEN!,
      mode: "auto", // "auto" | "polling" | "webhook"
      logging: true // use NestJS logger
    })
  ]
})
export class AppModule {}
