import type { loadConfig } from "openclaw/plugin-sdk/config-runtime";
import { type EnvelopeFormatOptions } from "openclaw/plugin-sdk/reply-runtime";
import type { WebInboundMsg } from "../types.js";
export declare function formatReplyContext(msg: WebInboundMsg): string | null;
export declare function buildInboundLine(params: {
    cfg: ReturnType<typeof loadConfig>;
    msg: WebInboundMsg;
    agentId: string;
    previousTimestamp?: number;
    envelope?: EnvelopeFormatOptions;
}): string;
