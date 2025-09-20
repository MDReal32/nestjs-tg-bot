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
import { Logger } from "@nestjs/common";

import type { LogLevel, LoggingOptions } from "../types";

/**
 * `makeLogger`
 *
 * Creates a per-bot NestJS `Logger` with optional logging configuration.
 *
 * - By default, logging is enabled at `"info"` level.
 * - If `cfg` is `false` (or `{ enabled: false }`), returns a no-op logger.
 * - If `cfg` is `true`, uses the default `"info"` level.
 * - If `cfg` is an object, you can control `enabled` and `level`.
 *
 * Supported levels:
 * - `"error"` → errors only
 * - `"warn"` → warnings + errors
 * - `"info"` → info, warnings, errors
 *
 * @example
 * ```ts
 * const logger = makeLogger("mybot", { enabled: true, level: "warn" });
 * logger.info("Hello"); // skipped
 * logger.warn("Be careful"); // logged
 * ```
 *
 * @param name - Bot instance name (used as logger context).
 * @param cfg - Boolean or `LoggingOptions` to control logging behavior.
 * @returns A configured `Logger` instance.
 */
export const makeLogger = (name: string, cfg?: boolean | LoggingOptions): Logger => {
  const context = `TelegramBot:${name}`;
  const base = new Logger(context);

  const enabled = cfg === true || (typeof cfg === "object" && (cfg.enabled ?? true));
  const min: LogLevel = typeof cfg === "object" && cfg.level ? cfg.level : "info";

  if (!enabled) {
    // No-op logger implementation
    return new (class extends Logger {
      override log() {}
      override warn() {}
      override error() {}
      override debug() {}
      override verbose() {}
    })(context);
  }

  const order: Record<LogLevel, number> = { error: 0, warn: 1, info: 2 };

  return new (class extends Logger {
    private allow(l: LogLevel) {
      return order[l] <= order[min];
    }
    log(message: string) {
      if (this.allow("info")) base.log(message);
    }
    warn(message: string) {
      if (this.allow("warn")) base.warn(message);
    }
    error(message: string, trace?: string) {
      if (this.allow("error")) base.error(message, trace);
    }
  })(context);
};
