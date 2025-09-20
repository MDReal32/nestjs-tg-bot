import { Logger } from "@nestjs/common";

import type { LogLevel, LoggingOptions } from "../types";

/** Per-bot NestJS logger (KISS). */
export const makeLogger = (name: string, cfg?: boolean | LoggingOptions): Logger => {
  const context = `TelegramBot:${name}`;
  const base = new Logger(context);

  const enabled = cfg === true || (typeof cfg === "object" && (cfg.enabled ?? true));
  const min: LogLevel = typeof cfg === "object" && cfg.level ? cfg.level : "info";

  if (!enabled) {
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
