import { type StatusReactionController } from "openclaw/plugin-sdk/channel-runtime";
import type { BuildTelegramMessageContextParams } from "./bot-message-context.types.js";
export type { BuildTelegramMessageContextParams, TelegramMediaRef, } from "./bot-message-context.types.js";
export declare const buildTelegramMessageContext: ({ primaryCtx, allMedia, replyMedia, storeAllowFrom, options, bot, cfg, account, historyLimit, groupHistories, dmPolicy, allowFrom, groupAllowFrom, ackReactionScope, logger, resolveGroupActivation, resolveGroupRequireMention, resolveTelegramGroupConfig, sendChatActionHandler, }: BuildTelegramMessageContextParams) => Promise<{
    ctxPayload: Record<string, unknown> & Omit<import("openclaw/plugin-sdk/reply-runtime").MsgContext, "CommandAuthorized"> & {
        CommandAuthorized: boolean;
    };
    primaryCtx: import("./bot/types.ts").TelegramContext;
    msg: import("@grammyjs/types").Message;
    chatId: number;
    isGroup: boolean;
    resolvedThreadId: number | undefined;
    threadSpec: import("./bot/helpers.js").TelegramThreadSpec;
    replyThreadId: number | undefined;
    isForum: boolean;
    historyKey: string | undefined;
    historyLimit: number;
    groupHistories: Map<string, import("openclaw/plugin-sdk/feishu").HistoryEntry[]>;
    route: import("openclaw/plugin-sdk/routing").ResolvedAgentRoute;
    skillFilter: string[] | undefined;
    sendTyping: () => Promise<void>;
    sendRecordVoice: () => Promise<void>;
    ackReactionPromise: Promise<boolean> | null;
    reactionApi: ((chatId: number | string, messageId: number, reactions: Array<{
        type: "emoji";
        emoji: string;
    }>) => Promise<void>) | null;
    removeAckAfterReply: boolean;
    statusReactionController: StatusReactionController | null;
    accountId: string;
} | null>;
export type TelegramMessageContext = NonNullable<Awaited<ReturnType<typeof buildTelegramMessageContext>>>;
