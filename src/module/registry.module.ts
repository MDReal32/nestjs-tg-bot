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
import { Global, Module } from "@nestjs/common";

import { TelegramBotsRegistry } from "../registry";

/**
 * `RegistryModule`
 *
 * A global NestJS module that provides the `TelegramBotsRegistry`.
 *
 * The registry is responsible for tracking all registered bot instances
 * by name, making them accessible across the application.
 *
 * Marked as `@Global()` so it only needs to be imported once and is
 * available throughout the NestJS app without re-import.
 */
@Global()
@Module({
  providers: [TelegramBotsRegistry],
  exports: [TelegramBotsRegistry]
})
export class RegistryModule {}
