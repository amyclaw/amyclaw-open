import type { OpenClawConfig } from "openclaw/plugin-sdk/twitch";
import type { TwitchAccountConfig } from "./types.js";
/**
 * Default account ID for Twitch
 */
export declare const DEFAULT_ACCOUNT_ID = "default";
/**
 * Get account config from core config
 *
 * Handles two patterns:
 * 1. Simplified single-account: base-level properties create implicit "default" account
 * 2. Multi-account: explicit accounts object
 *
 * For "default" account, base-level properties take precedence over accounts.default
 * For other accounts, only the accounts object is checked
 */
export declare function getAccountConfig(coreConfig: unknown, accountId: string): TwitchAccountConfig | null;
/**
 * List all configured account IDs
 *
 * Includes both explicit accounts and implicit "default" from base-level config
 */
export declare function listAccountIds(cfg: OpenClawConfig): string[];
