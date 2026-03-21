import type { ChannelMessageActionName, ChannelToolSend } from "openclaw/plugin-sdk/channel-runtime";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
export declare function listSlackMessageActions(cfg: OpenClawConfig): ChannelMessageActionName[];
export declare function extractSlackToolSend(args: Record<string, unknown>): ChannelToolSend | null;
