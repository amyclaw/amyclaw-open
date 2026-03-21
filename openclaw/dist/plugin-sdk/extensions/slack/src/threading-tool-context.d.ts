import type { ChannelThreadingContext, ChannelThreadingToolContext } from "openclaw/plugin-sdk/channel-runtime";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
export declare function buildSlackThreadingToolContext(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    context: ChannelThreadingContext;
    hasRepliedRef?: {
        value: boolean;
    };
}): ChannelThreadingToolContext;
