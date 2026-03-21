export type MSTeamsChannelResolution = {
    input: string;
    resolved: boolean;
    teamId?: string;
    teamName?: string;
    channelId?: string;
    channelName?: string;
    note?: string;
};
export type MSTeamsUserResolution = {
    input: string;
    resolved: boolean;
    id?: string;
    name?: string;
    note?: string;
};
export declare function normalizeMSTeamsMessagingTarget(raw: string): string | undefined;
export declare function normalizeMSTeamsUserInput(raw: string): string;
export declare function parseMSTeamsConversationId(raw: string): string | null;
export declare function parseMSTeamsTeamChannelInput(raw: string): {
    team?: string;
    channel?: string;
};
export declare function parseMSTeamsTeamEntry(raw: string): {
    teamKey: string;
    channelKey?: string;
} | null;
export declare function resolveMSTeamsChannelAllowlist(params: {
    cfg: unknown;
    entries: string[];
}): Promise<MSTeamsChannelResolution[]>;
export declare function resolveMSTeamsUserAllowlist(params: {
    cfg: unknown;
    entries: string[];
}): Promise<MSTeamsUserResolution[]>;
