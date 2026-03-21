import type { NostrProfile } from "./config-schema.js";
import { type MetricsSnapshot, type MetricEvent } from "./metrics.js";
import { type ProfilePublishResult } from "./nostr-profile.js";
export interface NostrBusOptions {
    /** Private key in hex or nsec format */
    privateKey: string;
    /** WebSocket relay URLs (defaults to damus + nos.lol) */
    relays?: string[];
    /** Account ID for state persistence (optional, defaults to pubkey prefix) */
    accountId?: string;
    /** Called when a DM is received */
    onMessage: (pubkey: string, text: string, reply: (text: string) => Promise<void>) => Promise<void>;
    /** Called on errors (optional) */
    onError?: (error: Error, context: string) => void;
    /** Called on connection status changes (optional) */
    onConnect?: (relay: string) => void;
    /** Called on disconnection (optional) */
    onDisconnect?: (relay: string) => void;
    /** Called on EOSE (end of stored events) for initial sync (optional) */
    onEose?: (relay: string) => void;
    /** Called on each metric event (optional) */
    onMetric?: (event: MetricEvent) => void;
    /** Maximum entries in seen tracker (default: 100,000) */
    maxSeenEntries?: number;
    /** Seen tracker TTL in ms (default: 1 hour) */
    seenTtlMs?: number;
}
export interface NostrBusHandle {
    /** Stop the bus and close connections */
    close: () => void;
    /** Get the bot's public key */
    publicKey: string;
    /** Send a DM to a pubkey */
    sendDm: (toPubkey: string, text: string) => Promise<void>;
    /** Get current metrics snapshot */
    getMetrics: () => MetricsSnapshot;
    /** Publish a profile (kind:0) to all relays */
    publishProfile: (profile: NostrProfile) => Promise<ProfilePublishResult>;
    /** Get the last profile publish state */
    getProfileState: () => Promise<{
        lastPublishedAt: number | null;
        lastPublishedEventId: string | null;
        lastPublishResults: Record<string, "ok" | "failed" | "timeout"> | null;
    }>;
}
/**
 * Validate and normalize a private key (accepts hex or nsec format)
 */
export declare function validatePrivateKey(key: string): Uint8Array;
/**
 * Get public key from private key (hex or nsec format)
 */
export declare function getPublicKeyFromPrivate(privateKey: string): string;
/**
 * Start the Nostr DM bus - subscribes to NIP-04 encrypted DMs
 */
export declare function startNostrBus(options: NostrBusOptions): Promise<NostrBusHandle>;
/**
 * Check if a string looks like a valid Nostr pubkey (hex or npub)
 */
export declare function isValidPubkey(input: string): boolean;
/**
 * Normalize a pubkey to hex format (accepts npub or hex)
 */
export declare function normalizePubkey(input: string): string;
/**
 * Convert a hex pubkey to npub format
 */
export declare function pubkeyToNpub(hexPubkey: string): string;
