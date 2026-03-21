import { type ChunkMode, type MarkdownTableMode, type MSTeamsReplyStyle, type ReplyPayload } from "openclaw/plugin-sdk/msteams";
import type { MSTeamsAccessTokenProvider } from "./attachments/types.js";
import type { StoredConversationReference } from "./conversation-store.js";
import { classifyMSTeamsSendError } from "./errors.js";
type SendContext = {
    sendActivity: (textOrActivity: string | object) => Promise<unknown>;
};
export type MSTeamsConversationReference = {
    activityId?: string;
    user?: {
        id?: string;
        name?: string;
        aadObjectId?: string;
    };
    agent?: {
        id?: string;
        name?: string;
        aadObjectId?: string;
    } | null;
    conversation: {
        id: string;
        conversationType?: string;
        tenantId?: string;
    };
    channelId: string;
    serviceUrl?: string;
    locale?: string;
};
export type MSTeamsAdapter = {
    continueConversation: (appId: string, reference: MSTeamsConversationReference, logic: (context: SendContext) => Promise<void>) => Promise<void>;
    process: (req: unknown, res: unknown, logic: (context: unknown) => Promise<void>) => Promise<void>;
};
export type MSTeamsReplyRenderOptions = {
    textChunkLimit: number;
    chunkText?: boolean;
    mediaMode?: "split" | "inline";
    tableMode?: MarkdownTableMode;
    chunkMode?: ChunkMode;
};
/**
 * A rendered message that preserves media vs text distinction.
 * When mediaUrl is present, it will be sent as a Bot Framework attachment.
 */
export type MSTeamsRenderedMessage = {
    text?: string;
    mediaUrl?: string;
};
export type MSTeamsSendRetryOptions = {
    maxAttempts?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
};
export type MSTeamsSendRetryEvent = {
    messageIndex: number;
    messageCount: number;
    nextAttempt: number;
    maxAttempts: number;
    delayMs: number;
    classification: ReturnType<typeof classifyMSTeamsSendError>;
};
export declare function buildConversationReference(ref: StoredConversationReference): MSTeamsConversationReference;
export declare function renderReplyPayloadsToMessages(replies: ReplyPayload[], options: MSTeamsReplyRenderOptions): MSTeamsRenderedMessage[];
export declare function sendMSTeamsMessages(params: {
    replyStyle: MSTeamsReplyStyle;
    adapter: MSTeamsAdapter;
    appId: string;
    conversationRef: StoredConversationReference;
    context?: SendContext;
    messages: MSTeamsRenderedMessage[];
    retry?: false | MSTeamsSendRetryOptions;
    onRetry?: (event: MSTeamsSendRetryEvent) => void;
    /** Token provider for OneDrive/SharePoint uploads in group chats/channels */
    tokenProvider?: MSTeamsAccessTokenProvider;
    /** SharePoint site ID for file uploads in group chats/channels */
    sharePointSiteId?: string;
    /** Max media size in bytes. Default: 100MB. */
    mediaMaxBytes?: number;
}): Promise<string[]>;
export {};
