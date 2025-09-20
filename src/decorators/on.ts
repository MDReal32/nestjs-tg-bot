import { META_KEYS } from "./meta-keys";

/** Register a raw filter, e.g. 'message:text' */
export const On = (filter: string) => (target: object, propertyKey: string | symbol) => {
  const ctor = (target as any).constructor ?? target;
  const list = (Reflect.getMetadata(META_KEYS.ON, ctor) as any[] | undefined) ?? [];
  list.push({ method: propertyKey, filter });
  Reflect.defineMetadata(META_KEYS.ON, list, ctor);
};
