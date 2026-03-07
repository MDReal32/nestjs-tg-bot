import type { Class } from "./class";

export type InjectInstances<TInject extends readonly Class[]> = {
  [K in keyof TInject]: InstanceType<TInject[K]>;
};
