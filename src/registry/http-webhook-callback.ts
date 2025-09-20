import type { IncomingMessage, ServerResponse } from "node:http";

/** grammY HTTP webhook handler signature */
export type HttpWebhookCallback = (req: IncomingMessage, res: ServerResponse) => Promise<void>;
