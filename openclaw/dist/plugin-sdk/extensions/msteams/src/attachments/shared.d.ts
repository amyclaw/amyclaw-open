import type { SsrFPolicy } from "openclaw/plugin-sdk/msteams";
import type { MSTeamsAttachmentLike } from "./types.js";
type InlineImageCandidate = {
    kind: "data";
    data: Buffer;
    contentType?: string;
    placeholder: string;
} | {
    kind: "url";
    url: string;
    contentType?: string;
    fileHint?: string;
    placeholder: string;
};
export declare const IMAGE_EXT_RE: RegExp;
export declare const IMG_SRC_RE: RegExp;
export declare const ATTACHMENT_TAG_RE: RegExp;
export declare const DEFAULT_MEDIA_HOST_ALLOWLIST: readonly ["graph.microsoft.com", "graph.microsoft.us", "graph.microsoft.de", "graph.microsoft.cn", "sharepoint.com", "sharepoint.us", "sharepoint.de", "sharepoint.cn", "sharepoint-df.com", "1drv.ms", "onedrive.com", "teams.microsoft.com", "teams.cdn.office.net", "statics.teams.cdn.office.net", "office.com", "office.net", "asm.skype.com", "ams.skype.com", "media.ams.skype.com", "trafficmanager.net", "blob.core.windows.net", "azureedge.net", "microsoft.com"];
export declare const DEFAULT_MEDIA_AUTH_HOST_ALLOWLIST: readonly ["api.botframework.com", "botframework.com", "graph.microsoft.com", "graph.microsoft.us", "graph.microsoft.de", "graph.microsoft.cn"];
export declare const GRAPH_ROOT = "https://graph.microsoft.com/v1.0";
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function resolveRequestUrl(input: RequestInfo | URL): string;
export declare function normalizeContentType(value: unknown): string | undefined;
export declare function inferPlaceholder(params: {
    contentType?: string;
    fileName?: string;
    fileType?: string;
}): string;
export declare function isLikelyImageAttachment(att: MSTeamsAttachmentLike): boolean;
/**
 * Returns true if the attachment can be downloaded (any file type).
 * Used when downloading all files, not just images.
 */
export declare function isDownloadableAttachment(att: MSTeamsAttachmentLike): boolean;
export declare function extractHtmlFromAttachment(att: MSTeamsAttachmentLike): string | undefined;
export declare function extractInlineImageCandidates(attachments: MSTeamsAttachmentLike[]): InlineImageCandidate[];
export declare function safeHostForUrl(url: string): string;
export declare function resolveAllowedHosts(input?: string[]): string[];
export declare function resolveAuthAllowedHosts(input?: string[]): string[];
export type MSTeamsAttachmentFetchPolicy = {
    allowHosts: string[];
    authAllowHosts: string[];
};
export declare function resolveAttachmentFetchPolicy(params?: {
    allowHosts?: string[];
    authAllowHosts?: string[];
}): MSTeamsAttachmentFetchPolicy;
export declare function isUrlAllowed(url: string, allowlist: string[]): boolean;
export declare function applyAuthorizationHeaderForUrl(params: {
    headers: Headers;
    url: string;
    authAllowHosts: string[];
    bearerToken?: string;
}): void;
export declare function resolveMediaSsrfPolicy(allowHosts: string[]): SsrFPolicy | undefined;
/**
 * Returns true if the given IPv4 or IPv6 address is in a private, loopback,
 * or link-local range that must never be reached from media downloads.
 *
 * Delegates to the SDK's `isPrivateIpAddress` which handles IPv4-mapped IPv6,
 * expanded notation, NAT64, 6to4, Teredo, octal IPv4, and fails closed on
 * parse errors.
 */
export declare const isPrivateOrReservedIP: (ip: string) => boolean;
/**
 * Resolve a hostname via DNS and reject private/reserved IPs.
 * Throws if the resolved IP is private or resolution fails.
 */
export declare function resolveAndValidateIP(hostname: string, resolveFn?: (hostname: string) => Promise<{
    address: string;
}>): Promise<string>;
/**
 * Fetch a URL with redirect: "manual", validating each redirect target
 * against the hostname allowlist and optional DNS-resolved IP (anti-SSRF).
 *
 * This prevents:
 * - Auto-following redirects to non-allowlisted hosts
 * - DNS rebinding attacks when a lookup function is provided
 */
export declare function safeFetch(params: {
    url: string;
    allowHosts: string[];
    /**
     * Optional allowlist for forwarding Authorization across redirects.
     * When set, Authorization is stripped before following redirects to hosts
     * outside this list.
     */
    authorizationAllowHosts?: string[];
    fetchFn?: typeof fetch;
    requestInit?: RequestInit;
    resolveFn?: (hostname: string) => Promise<{
        address: string;
    }>;
}): Promise<Response>;
export declare function safeFetchWithPolicy(params: {
    url: string;
    policy: MSTeamsAttachmentFetchPolicy;
    fetchFn?: typeof fetch;
    requestInit?: RequestInit;
    resolveFn?: (hostname: string) => Promise<{
        address: string;
    }>;
}): Promise<Response>;
export {};
