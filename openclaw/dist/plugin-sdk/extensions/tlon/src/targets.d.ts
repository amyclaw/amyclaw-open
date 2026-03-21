export type TlonTarget = {
    kind: "dm";
    ship: string;
} | {
    kind: "group";
    nest: string;
    hostShip: string;
    channelName: string;
};
export declare function normalizeShip(raw: string): string;
export declare function parseChannelNest(raw: string): {
    hostShip: string;
    channelName: string;
} | null;
export declare function parseTlonTarget(raw?: string | null): TlonTarget | null;
export declare function resolveTlonOutboundTarget(to?: string | null): {
    ok: false;
    error: Error;
    to?: undefined;
} | {
    ok: true;
    to: string;
    error?: undefined;
};
export declare function formatTargetHint(): string;
