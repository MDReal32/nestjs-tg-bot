import { META_KEYS } from "./meta-keys";

/** Bind this provider to a single bot name */
export const Scope =
  (name: string): ClassDecorator =>
  target =>
    Reflect.defineMetadata(META_KEYS.SCOPES, [name], target);

/** Bind this provider to multiple bot names */
export const Scopes =
  (names: readonly string[]): ClassDecorator =>
  target =>
    Reflect.defineMetadata(META_KEYS.SCOPES, [...names], target);
