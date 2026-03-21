export type ChannelSendRawResult = {
    ok: boolean;
    messageId?: string | null;
    error?: string | null;
};
/** Normalize raw channel send results into the shape shared outbound callers expect. */
export declare function buildChannelSendResult(channel: string, result: ChannelSendRawResult): {
    channel: string;
    ok: boolean;
    messageId: string;
    error: Error | undefined;
};
