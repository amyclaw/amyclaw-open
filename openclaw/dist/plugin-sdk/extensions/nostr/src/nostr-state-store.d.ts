type NostrBusState = {
    version: 2;
    /** Unix timestamp (seconds) of the last processed event */
    lastProcessedAt: number | null;
    /** Gateway startup timestamp (seconds) - events before this are old */
    gatewayStartedAt: number | null;
    /** Recent processed event IDs for overlap dedupe across restarts */
    recentEventIds: string[];
};
/** Profile publish state (separate from bus state) */
export type NostrProfileState = {
    version: 1;
    /** Unix timestamp (seconds) of last successful profile publish */
    lastPublishedAt: number | null;
    /** Event ID of the last published profile */
    lastPublishedEventId: string | null;
    /** Per-relay publish results from last attempt */
    lastPublishResults: Record<string, "ok" | "failed" | "timeout"> | null;
};
export declare function readNostrBusState(params: {
    accountId?: string;
    env?: NodeJS.ProcessEnv;
}): Promise<NostrBusState | null>;
export declare function writeNostrBusState(params: {
    accountId?: string;
    lastProcessedAt: number;
    gatewayStartedAt: number;
    recentEventIds?: string[];
    env?: NodeJS.ProcessEnv;
}): Promise<void>;
/**
 * Determine the `since` timestamp for subscription.
 * Returns the later of: lastProcessedAt or gatewayStartedAt (both from disk),
 * falling back to `now` for fresh starts.
 */
export declare function computeSinceTimestamp(state: NostrBusState | null, nowSec?: number): number;
export declare function readNostrProfileState(params: {
    accountId?: string;
    env?: NodeJS.ProcessEnv;
}): Promise<NostrProfileState | null>;
export declare function writeNostrProfileState(params: {
    accountId?: string;
    lastPublishedAt: number;
    lastPublishedEventId: string;
    lastPublishResults: Record<string, "ok" | "failed" | "timeout">;
    env?: NodeJS.ProcessEnv;
}): Promise<void>;
export {};
