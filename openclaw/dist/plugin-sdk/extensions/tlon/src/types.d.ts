import type { OpenClawConfig } from "openclaw/plugin-sdk/tlon";
export type TlonResolvedAccount = {
    accountId: string;
    name: string | null;
    enabled: boolean;
    configured: boolean;
    ship: string | null;
    url: string | null;
    code: string | null;
    allowPrivateNetwork: boolean | null;
    groupChannels: string[];
    dmAllowlist: string[];
    /** Ships allowed to invite us to groups (security: prevent malicious group invites) */
    groupInviteAllowlist: string[];
    autoDiscoverChannels: boolean | null;
    showModelSignature: boolean | null;
    autoAcceptDmInvites: boolean | null;
    autoAcceptGroupInvites: boolean | null;
    defaultAuthorizedShips: string[];
    /** Ship that receives approval requests for DMs, channel mentions, and group invites */
    ownerShip: string | null;
};
export declare function resolveTlonAccount(cfg: OpenClawConfig, accountId?: string | null): TlonResolvedAccount;
export declare function listTlonAccountIds(cfg: OpenClawConfig): string[];
