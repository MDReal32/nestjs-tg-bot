import type { Context as GrammyContext, MiddlewareFn } from "grammy";

import { META_KEYS } from "./meta-keys";

/** Apply grammY middleware(s). Works on class or method. */
export const Use =
  <C extends GrammyContext = GrammyContext>(...middlewares: readonly MiddlewareFn<C>[]) =>
  (target: object, propertyKey?: string | symbol) => {
    if (propertyKey !== undefined) {
      const list =
        (Reflect.getMetadata(META_KEYS.METHOD_USE, target, propertyKey) as MiddlewareFn<C>[] | undefined) ?? [];
      Reflect.defineMetadata(META_KEYS.METHOD_USE, [...list, ...middlewares], target, propertyKey);
    } else {
      const ctor = target as Function;
      const list = (Reflect.getMetadata(META_KEYS.CLASS_USE, ctor) as MiddlewareFn<C>[] | undefined) ?? [];
      Reflect.defineMetadata(META_KEYS.CLASS_USE, [...list, ...middlewares], ctor);
    }
  };
