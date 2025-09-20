import { META_KEYS } from "./meta-keys";

/** Register a /command */
export const Command = (command: string) => (target: object, propertyKey: string | symbol) => {
  const ctor = (target as any).constructor ?? target;
  const list = (Reflect.getMetadata(META_KEYS.COMMANDS, ctor) as any[] | undefined) ?? [];
  list.push({ method: propertyKey, command });
  Reflect.defineMetadata(META_KEYS.COMMANDS, list, ctor);
};
