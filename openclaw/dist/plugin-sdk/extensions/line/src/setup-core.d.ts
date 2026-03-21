import { listLineAccountIds } from "openclaw/plugin-sdk/line";
import type { ChannelSetupAdapter, OpenClawConfig } from "openclaw/plugin-sdk/setup";
export declare function patchLineAccountConfig(params: {
    cfg: OpenClawConfig;
    accountId: string;
    patch: Record<string, unknown>;
    clearFields?: string[];
    enabled?: boolean;
}): OpenClawConfig;
export declare function isLineConfigured(cfg: OpenClawConfig, accountId: string): boolean;
export declare function parseLineAllowFromId(raw: string): string | null;
export declare const lineSetupAdapter: ChannelSetupAdapter;
export { listLineAccountIds };
