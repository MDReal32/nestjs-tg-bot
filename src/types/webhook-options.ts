import type { RawApi } from "grammy";

/**
 * Get the second parameter type of Api["setWebhook"], i.e. the allowed fields.
 */
type SetWebhookOpts = NonNullable<Parameters<RawApi["setWebhook"]>[0]>;

export interface WebhookOptions extends SetWebhookOpts {}
