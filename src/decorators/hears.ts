import { META_KEYS } from "./meta-keys";

/** Register a hears trigger */
export const Hears = (trigger: string | RegExp) => (target: object, propertyKey: string | symbol) => {
  const ctor = (target as any).constructor ?? target;
  const list = (Reflect.getMetadata(META_KEYS.HEARS, ctor) as any[] | undefined) ?? [];
  list.push({ method: propertyKey, trigger });
  Reflect.defineMetadata(META_KEYS.HEARS, list, ctor);
};
