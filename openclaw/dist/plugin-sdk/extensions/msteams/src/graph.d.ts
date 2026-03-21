export type GraphUser = {
    id?: string;
    displayName?: string;
    userPrincipalName?: string;
    mail?: string;
};
export type GraphGroup = {
    id?: string;
    displayName?: string;
};
export type GraphChannel = {
    id?: string;
    displayName?: string;
};
export type GraphResponse<T> = {
    value?: T[];
};
export declare function normalizeQuery(value?: string | null): string;
export declare function escapeOData(value: string): string;
export declare function fetchGraphJson<T>(params: {
    token: string;
    path: string;
    headers?: Record<string, string>;
}): Promise<T>;
export declare function resolveGraphToken(cfg: unknown): Promise<string>;
export declare function listTeamsByName(token: string, query: string): Promise<GraphGroup[]>;
export declare function listChannelsForTeam(token: string, teamId: string): Promise<GraphChannel[]>;
