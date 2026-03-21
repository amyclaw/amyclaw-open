import type { OpenClawConfig } from "openclaw/plugin-sdk/nostr";
import type { NostrProfile } from "./config-schema.js";
export interface NostrAccountConfig {
    enabled?: boolean;
    name?: string;
    defaultAccount?: string;
    privateKey?: string;
    relays?: string[];
    dmPolicy?: "pairing" | "allowlist" | "open" | "disabled";
    allowFrom?: Array<string | number>;
    profile?: NostrProfile;
}
export interface ResolvedNostrAccount {
    accountId: string;
    name?: string;
    enabled: boolean;
    configured: boolean;
    privateKey: string;
    publicKey: string;
    relays: string[];
    profile?: NostrProfile;
    config: NostrAccountConfig;
}
/**
 * List all configured Nostr account IDs
 */
export declare function listNostrAccountIds(cfg: OpenClawConfig): string[];
/**
 * Get the default account ID
 */
export declare function resolveDefaultNostrAccountId(cfg: OpenClawConfig): string;
/**
 * Resolve a Nostr account from config
 */
export declare function resolveNostrAccount(opts: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): ResolvedNostrAccount;
