import type { MsgContext } from "openclaw/plugin-sdk/reply-runtime";
export declare function normalizeExplicitDiscordSessionKey(sessionKey: string, ctx: Pick<MsgContext, "ChatType" | "From" | "SenderId">): string;
