/**
 * Nostr Profile Management (NIP-01 kind:0)
 *
 * Profile events are "replaceable" - the latest created_at wins.
 * This module handles profile event creation and publishing.
 */
import { SimplePool, type Event } from "nostr-tools";
import { type NostrProfile } from "./config-schema.js";
/** Result of a profile publish attempt */
export interface ProfilePublishResult {
    /** Event ID of the published profile */
    eventId: string;
    /** Relays that successfully received the event */
    successes: string[];
    /** Relays that failed with their error messages */
    failures: Array<{
        relay: string;
        error: string;
    }>;
    /** Unix timestamp when the event was created */
    createdAt: number;
}
/** NIP-01 profile content (JSON inside kind:0 event) */
export interface ProfileContent {
    name?: string;
    display_name?: string;
    about?: string;
    picture?: string;
    banner?: string;
    website?: string;
    nip05?: string;
    lud16?: string;
}
/**
 * Convert our config profile schema to NIP-01 content format.
 * Strips undefined fields and validates URLs.
 */
export declare function profileToContent(profile: NostrProfile): ProfileContent;
/**
 * Convert NIP-01 content format back to our config profile schema.
 * Useful for importing existing profiles from relays.
 */
export declare function contentToProfile(content: ProfileContent): NostrProfile;
/**
 * Create a signed kind:0 profile event.
 *
 * @param sk - Private key as Uint8Array (32 bytes)
 * @param profile - Profile data to include
 * @param lastPublishedAt - Previous profile timestamp (for monotonic guarantee)
 * @returns Signed Nostr event
 */
export declare function createProfileEvent(sk: Uint8Array, profile: NostrProfile, lastPublishedAt?: number): Event;
/**
 * Publish a profile event to multiple relays.
 *
 * Best-effort: publishes to all relays in parallel, reports per-relay results.
 * Does NOT retry automatically - caller should handle retries if needed.
 *
 * @param pool - SimplePool instance for relay connections
 * @param relays - Array of relay WebSocket URLs
 * @param event - Signed profile event (kind:0)
 * @returns Publish results with successes and failures
 */
export declare function publishProfileEvent(pool: SimplePool, relays: string[], event: Event): Promise<ProfilePublishResult>;
/**
 * Create and publish a profile event in one call.
 *
 * @param pool - SimplePool instance
 * @param sk - Private key as Uint8Array
 * @param relays - Array of relay URLs
 * @param profile - Profile data
 * @param lastPublishedAt - Previous timestamp for monotonic ordering
 * @returns Publish results
 */
export declare function publishProfile(pool: SimplePool, sk: Uint8Array, relays: string[], profile: NostrProfile, lastPublishedAt?: number): Promise<ProfilePublishResult>;
/**
 * Validate a profile without throwing (returns result object).
 */
export declare function validateProfile(profile: unknown): {
    valid: boolean;
    profile?: NostrProfile;
    errors?: string[];
};
/**
 * Sanitize profile text fields to prevent XSS when displaying in UI.
 * Escapes HTML special characters.
 */
export declare function sanitizeProfileForDisplay(profile: NostrProfile): NostrProfile;
