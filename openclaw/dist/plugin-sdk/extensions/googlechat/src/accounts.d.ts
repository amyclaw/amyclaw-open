import { type OpenClawConfig } from "openclaw/plugin-sdk/googlechat";
import type { GoogleChatAccountConfig } from "./types.config.js";
export type GoogleChatCredentialSource = "file" | "inline" | "env" | "none";
export type ResolvedGoogleChatAccount = {
    accountId: string;
    name?: string;
    enabled: boolean;
    config: GoogleChatAccountConfig;
    credentialSource: GoogleChatCredentialSource;
    credentials?: Record<string, unknown>;
    credentialsFile?: string;
};
declare const listGoogleChatAccountIds: (cfg: OpenClawConfig) => string[], resolveDefaultGoogleChatAccountId: (cfg: OpenClawConfig) => string;
export { listGoogleChatAccountIds, resolveDefaultGoogleChatAccountId };
export declare function resolveGoogleChatAccount(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): ResolvedGoogleChatAccount;
export declare function listEnabledGoogleChatAccounts(cfg: OpenClawConfig): ResolvedGoogleChatAccount[];
