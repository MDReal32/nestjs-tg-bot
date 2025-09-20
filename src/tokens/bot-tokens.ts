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
import { makeToken } from "./token";

/**
 * Unique NestJS injection token for the bot instance options.
 *
 * @param name - Bot name (unique per instance).
 */
export const TG_OPTIONS = (name: string) => makeToken(`TG_OPTIONS:${name}`);

/**
 * Unique NestJS injection token for the grammY `Bot` instance.
 *
 * @param name - Bot name (unique per instance).
 */
export const TG_BOT = (name: string) => makeToken(`TG_BOT:${name}`);

/**
 * Unique NestJS injection token for the grammY `Api` client.
 *
 * @param name - Bot name (unique per instance).
 */
export const TG_API = (name: string) => makeToken(`TG_API:${name}`);

/**
 * Unique NestJS injection token for the HTTP webhook callback.
 *
 * @param name - Bot name (unique per instance).
 */
export const TG_WEBHOOK_CALLBACK = (name: string) => makeToken(`TG_WEBHOOK_CALLBACK:${name}`);
