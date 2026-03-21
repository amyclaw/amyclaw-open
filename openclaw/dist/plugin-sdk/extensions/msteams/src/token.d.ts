import type { MSTeamsConfig } from "openclaw/plugin-sdk/msteams";
export type MSTeamsCredentials = {
    appId: string;
    appPassword: string;
    tenantId: string;
};
export declare function hasConfiguredMSTeamsCredentials(cfg?: MSTeamsConfig): boolean;
export declare function resolveMSTeamsCredentials(cfg?: MSTeamsConfig): MSTeamsCredentials | undefined;
