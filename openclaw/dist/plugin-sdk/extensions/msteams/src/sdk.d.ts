import type { MSTeamsAdapter } from "./messenger.js";
import type { MSTeamsCredentials } from "./token.js";
export type MSTeamsSdk = typeof import("@microsoft/agents-hosting");
export type MSTeamsAuthConfig = ReturnType<MSTeamsSdk["getAuthConfigWithDefaults"]>;
export declare function loadMSTeamsSdk(): Promise<MSTeamsSdk>;
export declare function buildMSTeamsAuthConfig(creds: MSTeamsCredentials, sdk: MSTeamsSdk): MSTeamsAuthConfig;
export declare function createMSTeamsAdapter(authConfig: MSTeamsAuthConfig, sdk: MSTeamsSdk): MSTeamsAdapter;
export declare function loadMSTeamsSdkWithAuth(creds: MSTeamsCredentials): Promise<{
    sdk: typeof import("@microsoft/agents-hosting");
    authConfig: import("@microsoft/agents-hosting").AuthConfiguration;
}>;
