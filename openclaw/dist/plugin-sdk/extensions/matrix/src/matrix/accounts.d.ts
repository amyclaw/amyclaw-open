import type { CoreConfig, MatrixConfig } from "../types.js";
export type ResolvedMatrixAccount = {
    accountId: string;
    enabled: boolean;
    name?: string;
    configured: boolean;
    homeserver?: string;
    userId?: string;
    config: MatrixConfig;
};
declare const listMatrixAccountIds: (cfg: import("openclaw/plugin-sdk/matrix").OpenClawConfig) => string[], resolveDefaultMatrixAccountId: (cfg: import("openclaw/plugin-sdk/matrix").OpenClawConfig) => string;
export { listMatrixAccountIds, resolveDefaultMatrixAccountId };
export declare function resolveMatrixAccount(params: {
    cfg: CoreConfig;
    accountId?: string | null;
}): ResolvedMatrixAccount;
export declare function resolveMatrixAccountConfig(params: {
    cfg: CoreConfig;
    accountId?: string | null;
}): MatrixConfig;
export declare function listEnabledMatrixAccounts(cfg: CoreConfig): ResolvedMatrixAccount[];
