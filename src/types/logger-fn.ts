import type { LogLevel } from "./log-level";

export type LoggerFn = (level: LogLevel, message: string, meta?: unknown) => void;
