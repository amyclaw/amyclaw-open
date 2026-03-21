import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import type { OpenClawConfig } from "../../config/config.js";
import type { ChannelMessageCapability } from "./message-capabilities.js";
import type { ChannelMessageActionContext, ChannelMessageActionName } from "./types.js";
export declare function listChannelMessageActions(cfg: OpenClawConfig): ChannelMessageActionName[];
export declare function listChannelMessageCapabilities(cfg: OpenClawConfig): ChannelMessageCapability[];
export declare function listChannelMessageCapabilitiesForChannel(params: {
    cfg: OpenClawConfig;
    channel?: string;
}): ChannelMessageCapability[];
export declare function channelSupportsMessageCapability(cfg: OpenClawConfig, capability: ChannelMessageCapability): boolean;
export declare function channelSupportsMessageCapabilityForChannel(params: {
    cfg: OpenClawConfig;
    channel?: string;
}, capability: ChannelMessageCapability): boolean;
export declare function dispatchChannelMessageAction(ctx: ChannelMessageActionContext): Promise<AgentToolResult<unknown> | null>;
export declare const __testing: {
    resetLoggedMessageActionErrors(): void;
};
