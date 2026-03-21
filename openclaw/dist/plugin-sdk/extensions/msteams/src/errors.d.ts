export declare function formatUnknownError(err: unknown): string;
export type MSTeamsSendErrorKind = "auth" | "throttled" | "transient" | "permanent" | "unknown";
export type MSTeamsSendErrorClassification = {
    kind: MSTeamsSendErrorKind;
    statusCode?: number;
    retryAfterMs?: number;
};
/**
 * Classify outbound send errors for safe retries and actionable logs.
 *
 * Important: We only mark errors as retryable when we have an explicit HTTP
 * status code that indicates the message was not accepted (e.g. 429, 5xx).
 * For transport-level errors where delivery is ambiguous, we prefer to avoid
 * retries to reduce the chance of duplicate posts.
 */
export declare function classifyMSTeamsSendError(err: unknown): MSTeamsSendErrorClassification;
/**
 * Detect whether an error is caused by a revoked Proxy.
 *
 * The Bot Framework SDK wraps TurnContext in a Proxy that is revoked once the
 * turn handler returns.  Any later access (e.g. from a debounced callback)
 * throws a TypeError whose message contains the distinctive "proxy that has
 * been revoked" string.
 */
export declare function isRevokedProxyError(err: unknown): boolean;
export declare function formatMSTeamsSendErrorHint(classification: MSTeamsSendErrorClassification): string | undefined;
