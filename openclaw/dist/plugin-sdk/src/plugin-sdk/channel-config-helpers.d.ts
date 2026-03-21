import { collectAllowlistProviderGroupPolicyWarnings, collectAllowlistProviderRestrictSendersWarnings, collectOpenGroupPolicyConfiguredRouteWarnings, collectOpenGroupPolicyRouteAllowlistWarnings, collectOpenProviderGroupPolicyWarnings } from "../channels/plugins/group-policy-warnings.js";
import { buildAccountScopedDmSecurityPolicy } from "../channels/plugins/helpers.js";
import type { ChannelConfigAdapter } from "../channels/plugins/types.adapters.js";
import type { OpenClawConfig } from "../config/config.js";
/** Coerce mixed allowlist config values into plain strings without trimming or deduping. */
export declare function mapAllowFromEntries(allowFrom: Array<string | number> | null | undefined): string[];
/** Normalize user-facing allowlist entries the same way config and doctor flows expect. */
export declare function formatTrimmedAllowFromEntries(allowFrom: Array<string | number>): string[];
/** Collapse nullable config scalars into a trimmed optional string. */
export declare function resolveOptionalConfigString(value: string | number | null | undefined): string | undefined;
/** Build the shared allowlist/default target adapter surface for account-scoped channel configs. */
export declare function createScopedAccountConfigAccessors<ResolvedAccount>(params: {
    resolveAccount: (params: {
        cfg: OpenClawConfig;
        accountId?: string | null;
    }) => ResolvedAccount;
    resolveAllowFrom: (account: ResolvedAccount) => Array<string | number> | null | undefined;
    formatAllowFrom: (allowFrom: Array<string | number>) => string[];
    resolveDefaultTo?: (account: ResolvedAccount) => string | number | null | undefined;
}): Pick<ChannelConfigAdapter<ResolvedAccount>, "resolveAllowFrom" | "formatAllowFrom" | "resolveDefaultTo">;
/** Build the common CRUD/config helpers for channels that store multiple named accounts. */
export declare function createScopedChannelConfigBase<ResolvedAccount, Config extends OpenClawConfig = OpenClawConfig>(params: {
    sectionKey: string;
    listAccountIds: (cfg: Config) => string[];
    resolveAccount: (cfg: Config, accountId?: string | null) => ResolvedAccount;
    defaultAccountId: (cfg: Config) => string;
    inspectAccount?: (cfg: Config, accountId?: string | null) => unknown;
    clearBaseFields: string[];
    allowTopLevel?: boolean;
}): Pick<ChannelConfigAdapter<ResolvedAccount>, "listAccountIds" | "resolveAccount" | "inspectAccount" | "defaultAccountId" | "setAccountEnabled" | "deleteAccount">;
/** Convert account-specific DM security fields into the shared runtime policy resolver shape. */
export declare function createScopedDmSecurityResolver<ResolvedAccount extends {
    accountId?: string | null;
}>(params: {
    channelKey: string;
    resolvePolicy: (account: ResolvedAccount) => string | null | undefined;
    resolveAllowFrom: (account: ResolvedAccount) => Array<string | number> | null | undefined;
    resolveFallbackAccountId?: (account: ResolvedAccount) => string | null | undefined;
    defaultPolicy?: string;
    allowFromPathSuffix?: string;
    policyPathSuffix?: string;
    approveChannelId?: string;
    approveHint?: string;
    normalizeEntry?: (raw: string) => string;
}): ({ cfg, accountId, account, }: {
    cfg: OpenClawConfig;
    accountId?: string | null;
    account: ResolvedAccount;
}) => import("./channel-runtime.ts").ChannelSecurityDmPolicy;
export { buildAccountScopedDmSecurityPolicy };
export { collectAllowlistProviderGroupPolicyWarnings, collectAllowlistProviderRestrictSendersWarnings, collectOpenGroupPolicyConfiguredRouteWarnings, collectOpenGroupPolicyRouteAllowlistWarnings, collectOpenProviderGroupPolicyWarnings, };
/** Read the effective WhatsApp allowlist through the active plugin contract. */
export declare function resolveWhatsAppConfigAllowFrom(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string[];
/** Format WhatsApp allowlist entries with the same normalization used by the channel plugin. */
export declare function formatWhatsAppConfigAllowFromEntries(allowFrom: Array<string | number>): string[];
/** Resolve the effective WhatsApp default recipient after account and root config fallback. */
export declare function resolveWhatsAppConfigDefaultTo(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string | undefined;
/** Read iMessage allowlist entries from the active plugin's resolved account view. */
export declare function resolveIMessageConfigAllowFrom(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string[];
/** Resolve the effective iMessage default recipient from the plugin-resolved account config. */
export declare function resolveIMessageConfigDefaultTo(params: {
    cfg: OpenClawConfig;
    accountId?: string | null;
}): string | undefined;
