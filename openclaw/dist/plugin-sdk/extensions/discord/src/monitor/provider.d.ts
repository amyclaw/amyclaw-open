import { resolveThreadBindingsEnabled } from "openclaw/plugin-sdk/channel-runtime";
import type { OpenClawConfig, ReplyToMode } from "openclaw/plugin-sdk/config-runtime";
import { resolveOpenProviderRuntimeGroupPolicy, resolveDefaultGroupPolicy } from "openclaw/plugin-sdk/config-runtime";
import { type RuntimeEnv } from "openclaw/plugin-sdk/runtime-env";
import { createDiscordGatewayPlugin } from "./gateway-plugin.js";
import { resolveDiscordRestFetch } from "./rest-fetch.js";
import type { DiscordMonitorStatusSink } from "./status.js";
export type MonitorDiscordOpts = {
    token?: string;
    accountId?: string;
    config?: OpenClawConfig;
    runtime?: RuntimeEnv;
    abortSignal?: AbortSignal;
    mediaMaxMb?: number;
    historyLimit?: number;
    replyToMode?: ReplyToMode;
    setStatus?: DiscordMonitorStatusSink;
};
export declare function monitorDiscordProvider(opts?: MonitorDiscordOpts): Promise<void>;
export declare const __testing: {
    createDiscordGatewayPlugin: typeof createDiscordGatewayPlugin;
    resolveDiscordRuntimeGroupPolicy: typeof resolveOpenProviderRuntimeGroupPolicy;
    resolveDefaultGroupPolicy: typeof resolveDefaultGroupPolicy;
    resolveDiscordRestFetch: typeof resolveDiscordRestFetch;
    resolveThreadBindingsEnabled: typeof resolveThreadBindingsEnabled;
};
