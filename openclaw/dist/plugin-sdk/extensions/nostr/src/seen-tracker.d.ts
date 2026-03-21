/**
 * LRU-based seen event tracker with TTL support.
 * Prevents unbounded memory growth under high load or abuse.
 */
export interface SeenTrackerOptions {
    /** Maximum number of entries to track (default: 100,000) */
    maxEntries?: number;
    /** TTL in milliseconds (default: 1 hour) */
    ttlMs?: number;
    /** Prune interval in milliseconds (default: 10 minutes) */
    pruneIntervalMs?: number;
}
export interface SeenTracker {
    /** Check if an ID has been seen (also marks it as seen if not) */
    has: (id: string) => boolean;
    /** Mark an ID as seen */
    add: (id: string) => void;
    /** Check if ID exists without marking */
    peek: (id: string) => boolean;
    /** Delete an ID */
    delete: (id: string) => void;
    /** Clear all entries */
    clear: () => void;
    /** Get current size */
    size: () => number;
    /** Stop the pruning timer */
    stop: () => void;
    /** Pre-seed with IDs (useful for restart recovery) */
    seed: (ids: string[]) => void;
}
/**
 * Create a new seen tracker with LRU eviction and TTL expiration.
 */
export declare function createSeenTracker(options?: SeenTrackerOptions): SeenTracker;
