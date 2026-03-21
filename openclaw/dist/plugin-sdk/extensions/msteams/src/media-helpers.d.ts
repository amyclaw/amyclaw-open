/**
 * MIME type detection and filename extraction for MSTeams media attachments.
 */
/**
 * Detect MIME type from URL extension or data URL.
 * Uses shared MIME detection for consistency with core handling.
 */
export declare function getMimeType(url: string): Promise<string>;
/**
 * Extract filename from URL or local path.
 * For local paths, extracts original filename if stored with embedded name pattern.
 * Falls back to deriving the extension from MIME type when no extension present.
 */
export declare function extractFilename(url: string): Promise<string>;
/**
 * Check if a URL refers to a local file path.
 */
export declare function isLocalPath(url: string): boolean;
/**
 * Extract the message ID from a Bot Framework response.
 */
export declare function extractMessageId(response: unknown): string | null;
