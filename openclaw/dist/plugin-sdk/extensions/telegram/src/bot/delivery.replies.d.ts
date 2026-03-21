import { type Bot } from "grammy";
import type { ReplyToMode } from "openclaw/plugin-sdk/config-runtime";
import type { MarkdownTableMode } from "openclaw/plugin-sdk/config-runtime";
import { type ChunkMode } from "openclaw/plugin-sdk/reply-runtime";
import type { ReplyPayload } from "openclaw/plugin-sdk/reply-runtime";
import type { RuntimeEnv } from "openclaw/plugin-sdk/runtime-env";
import { type TelegramThreadSpec } from "./helpers.js";
export declare function deliverReplies(params: {
    replies: ReplyPayload[];
    chatId: string;
    accountId?: string;
    sessionKeyForInternalHooks?: string;
    mirrorIsGroup?: boolean;
    mirrorGroupId?: string;
    token: string;
    runtime: RuntimeEnv;
    bot: Bot;
    mediaLocalRoots?: readonly string[];
    replyToMode: ReplyToMode;
    textLimit: number;
    thread?: TelegramThreadSpec | null;
    tableMode?: MarkdownTableMode;
    chunkMode?: ChunkMode;
    /** Callback invoked before sending a voice message to switch typing indicator. */
    onVoiceRecording?: () => Promise<void> | void;
    /** Controls whether link previews are shown. Default: true (previews enabled). */
    linkPreview?: boolean;
    /** When true, messages are sent with disable_notification. */
    silent?: boolean;
    /** Optional quote text for Telegram reply_parameters. */
    replyQuoteText?: string;
}): Promise<{
    delivered: boolean;
}>;
