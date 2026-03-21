export type OutboundReplyPayload = {
    text?: string;
    mediaUrls?: string[];
    mediaUrl?: string;
    replyToId?: string;
};
/** Extract the supported outbound reply fields from loose tool or agent payload objects. */
export declare function normalizeOutboundReplyPayload(payload: Record<string, unknown>): OutboundReplyPayload;
/** Wrap a deliverer so callers can hand it arbitrary payloads while channels receive normalized data. */
export declare function createNormalizedOutboundDeliverer(handler: (payload: OutboundReplyPayload) => Promise<void>): (payload: unknown) => Promise<void>;
/** Prefer multi-attachment payloads, then fall back to the legacy single-media field. */
export declare function resolveOutboundMediaUrls(payload: {
    mediaUrls?: string[];
    mediaUrl?: string;
}): string[];
/** Send media-first payloads intact, or chunk text-only payloads through the caller's transport hooks. */
export declare function sendPayloadWithChunkedTextAndMedia<TContext extends {
    payload: object;
}, TResult>(params: {
    ctx: TContext;
    textChunkLimit?: number;
    chunker?: ((text: string, limit: number) => string[]) | null;
    sendText: (ctx: TContext & {
        text: string;
    }) => Promise<TResult>;
    sendMedia: (ctx: TContext & {
        text: string;
        mediaUrl: string;
    }) => Promise<TResult>;
    emptyResult: TResult;
}): Promise<TResult>;
/** Detect numeric-looking target ids for channels that distinguish ids from handles. */
export declare function isNumericTargetId(raw: string): boolean;
/** Append attachment links to plain text when the channel cannot send media inline. */
export declare function formatTextWithAttachmentLinks(text: string | undefined, mediaUrls: string[]): string;
/** Send a caption with only the first media item, mirroring caption-limited channel transports. */
export declare function sendMediaWithLeadingCaption(params: {
    mediaUrls: string[];
    caption: string;
    send: (payload: {
        mediaUrl: string;
        caption?: string;
    }) => Promise<void>;
    onError?: (error: unknown, mediaUrl: string) => void;
}): Promise<boolean>;
