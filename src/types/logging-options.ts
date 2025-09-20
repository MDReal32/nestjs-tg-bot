import type { LogLevel } from "./log-level";
import type { LoggerFn } from "./logger-fn";

export interface LoggingOptions {
  readonly enabled?: boolean;
  readonly level?: LogLevel;
  readonly logger?: LoggerFn;
}
