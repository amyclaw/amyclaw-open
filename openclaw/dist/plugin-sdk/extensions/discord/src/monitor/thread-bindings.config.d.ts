import { resolveThreadBindingIdleTimeoutMs, resolveThreadBindingMaxAgeMs, resolveThreadBindingsEnabled } from "openclaw/plugin-sdk/channel-runtime";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
export { resolveThreadBindingIdleTimeoutMs, resolveThreadBindingMaxAgeMs, resolveThreadBindingsEnabled, };
export declare function resolveDiscordThreadBindingIdleTimeoutMs(params: {
    cfg: OpenClawConfig;
    accountId?: string;
}): number;
export declare function resolveDiscordThreadBindingMaxAgeMs(params: {
    cfg: OpenClawConfig;
    accountId?: string;
}): number;
