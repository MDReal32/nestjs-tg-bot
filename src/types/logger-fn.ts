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
import type { LogLevel } from "./log-level";

/**
 * Custom logger function signature for per-bot logging.
 *
 * Allows developers to override the default NestJS logger with
 * their own logging integration (e.g., Winston, Pino).
 *
 * @param level - The log level (`"info"`, `"warn"`, `"error"`).
 * @param message - The message to log.
 * @param meta - Optional metadata (structured object, error, etc).
 *
 * @example
 * ```ts
 * const customLogger: LoggerFn = (level, message, meta) => {
 *   console.log(`[${level}] ${message}`, meta);
 * };
 * ```
 */
export type LoggerFn = (level: LogLevel, message: string, meta?: unknown) => void;
