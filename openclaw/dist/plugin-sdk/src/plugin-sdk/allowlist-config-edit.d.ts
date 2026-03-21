import type { ChannelAllowlistAdapter } from "../channels/plugins/types.adapters.js";
import type { ChannelId } from "../channels/plugins/types.js";
import type { OpenClawConfig } from "../config/config.js";
type AllowlistConfigPaths = {
    readPaths: string[][];
    writePath: string[];
    cleanupPaths?: string[][];
};
export declare function resolveLegacyDmAllowlistConfigPaths(scope: "dm" | "group"): AllowlistConfigPaths | null;
/** Build the default account-scoped allowlist editor used by channel plugins with config-backed lists. */
export declare function buildAccountScopedAllowlistConfigEditor(params: {
    channelId: ChannelId;
    normalize: (params: {
        cfg: OpenClawConfig;
        accountId?: string | null;
        values: Array<string | number>;
    }) => string[];
    resolvePaths: (scope: "dm" | "group") => AllowlistConfigPaths | null;
}): NonNullable<ChannelAllowlistAdapter["applyConfigEdit"]>;
export {};
