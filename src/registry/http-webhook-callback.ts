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
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * `HttpWebhookCallback`
 *
 * The standard Node.js HTTP handler signature used by grammY when
 * running in **webhook mode**.
 *
 * - Accepts a Node `IncomingMessage` and `ServerResponse`.
 * - Returns a `Promise<void>`, so it can be awaited or used in async contexts.
 *
 * Typically passed to HTTP frameworks (like Express, Fastify, Nest’s
 * raw server) as a request handler.
 *
 * @example
 * ```ts
 * const callback: HttpWebhookCallback = bot.webhookCallback("http");
 * http.createServer(callback).listen(3000);
 * ```
 */
export type HttpWebhookCallback = (req: IncomingMessage, res: ServerResponse) => Promise<void>;
