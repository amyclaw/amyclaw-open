/**
 * Comprehensive metrics system for Nostr bus observability.
 * Provides clear insight into what's happening with events, relays, and operations.
 */
export type EventMetricName = "event.received" | "event.processed" | "event.duplicate" | "event.rejected.invalid_shape" | "event.rejected.wrong_kind" | "event.rejected.stale" | "event.rejected.future" | "event.rejected.rate_limited" | "event.rejected.invalid_signature" | "event.rejected.oversized_ciphertext" | "event.rejected.oversized_plaintext" | "event.rejected.decrypt_failed" | "event.rejected.self_message";
export type RelayMetricName = "relay.connect" | "relay.disconnect" | "relay.reconnect" | "relay.error" | "relay.message.event" | "relay.message.eose" | "relay.message.closed" | "relay.message.notice" | "relay.message.ok" | "relay.message.auth" | "relay.circuit_breaker.open" | "relay.circuit_breaker.close" | "relay.circuit_breaker.half_open";
export type RateLimitMetricName = "rate_limit.per_sender" | "rate_limit.global";
export type DecryptMetricName = "decrypt.success" | "decrypt.failure";
export type MemoryMetricName = "memory.seen_tracker_size" | "memory.rate_limiter_entries";
export type MetricName = EventMetricName | RelayMetricName | RateLimitMetricName | DecryptMetricName | MemoryMetricName;
type RelayMetrics = {
    connects: number;
    disconnects: number;
    reconnects: number;
    errors: number;
    messagesReceived: {
        event: number;
        eose: number;
        closed: number;
        notice: number;
        ok: number;
        auth: number;
    };
    circuitBreakerState: "closed" | "open" | "half_open";
    circuitBreakerOpens: number;
    circuitBreakerCloses: number;
};
export interface MetricEvent {
    /** Metric name (e.g., "event.received", "relay.connect") */
    name: MetricName;
    /** Metric value (usually 1 for counters, or a measured value) */
    value: number;
    /** Unix timestamp in milliseconds */
    timestamp: number;
    /** Optional labels for additional context */
    labels?: Record<string, string | number>;
}
export type OnMetricCallback = (event: MetricEvent) => void;
export interface MetricsSnapshot {
    /** Total events received (before any filtering) */
    eventsReceived: number;
    /** Events successfully processed */
    eventsProcessed: number;
    /** Duplicate events skipped */
    eventsDuplicate: number;
    /** Events rejected by reason */
    eventsRejected: {
        invalidShape: number;
        wrongKind: number;
        stale: number;
        future: number;
        rateLimited: number;
        invalidSignature: number;
        oversizedCiphertext: number;
        oversizedPlaintext: number;
        decryptFailed: number;
        selfMessage: number;
    };
    /** Relay stats by URL */
    relays: Record<string, RelayMetrics>;
    /** Rate limiting stats */
    rateLimiting: {
        perSenderHits: number;
        globalHits: number;
    };
    /** Decrypt stats */
    decrypt: {
        success: number;
        failure: number;
    };
    /** Memory/capacity stats */
    memory: {
        seenTrackerSize: number;
        rateLimiterEntries: number;
    };
    /** Snapshot timestamp */
    snapshotAt: number;
}
export interface NostrMetrics {
    /** Emit a metric event */
    emit: (name: MetricName, value?: number, labels?: Record<string, string | number>) => void;
    /** Get current metrics snapshot */
    getSnapshot: () => MetricsSnapshot;
    /** Reset all metrics to zero */
    reset: () => void;
}
/**
 * Create a metrics collector instance.
 * Optionally pass an onMetric callback to receive real-time metric events.
 */
export declare function createMetrics(onMetric?: OnMetricCallback): NostrMetrics;
/**
 * Create a no-op metrics instance (for when metrics are disabled).
 */
export declare function createNoopMetrics(): NostrMetrics;
export {};
