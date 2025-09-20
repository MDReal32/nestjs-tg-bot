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
import type { LoggerFn } from "./logger-fn";

/**
 * Options for configuring per-bot logging.
 *
 * Allows fine-grained control over what gets logged and how.
 * Used in `BotInstanceOptions.logging`.
 */
export interface LoggingOptions {
  /**
   * Whether logging is enabled.
   *
   * - Defaults to `true` if not specified.
   */
  readonly enabled?: boolean;

  /**
   * Minimum log level to output.
   *
   * - `"error"` → errors only
   * - `"warn"` → warnings + errors
   * - `"info"` → info + warnings + errors (default)
   */
  readonly level?: LogLevel;

  /**
   * Optional custom logger function.
   *
   * If provided, it replaces the default NestJS `Logger`.
   * Useful for integrating with logging systems like Winston or Pino.
   *
   * @example
   * ```ts
   * const logger: LoggerFn = (level, message, meta) => {
   *   console.log(`[${level}] ${message}`, meta);
   * };
   *
   * const options: LoggingOptions = {
   *   enabled: true,
   *   level: "warn",
   *   logger,
   * };
   * ```
   */
  readonly logger?: LoggerFn;
}
