import { Global, Module } from "@nestjs/common";

import { TelegramBotsRegistry } from "../registry";

@Global()
@Module({
  providers: [TelegramBotsRegistry],
  exports: [TelegramBotsRegistry]
})
export class RegistryModule {}
