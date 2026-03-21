/**
 * Shared helpers for FileConsentCard flow in MSTeams.
 *
 * FileConsentCard is required for:
 * - Personal (1:1) chats with large files (>=4MB)
 * - Personal chats with non-image files (PDFs, documents, etc.)
 *
 * This module consolidates the logic used by both send.ts (proactive sends)
 * and messenger.ts (reply path) to avoid duplication.
 */
export type FileConsentMedia = {
    buffer: Buffer;
    filename: string;
    contentType?: string;
};
export type FileConsentActivityResult = {
    activity: Record<string, unknown>;
    uploadId: string;
};
/**
 * Prepare a FileConsentCard activity for large files or non-images in personal chats.
 * Returns the activity object and uploadId - caller is responsible for sending.
 */
export declare function prepareFileConsentActivity(params: {
    media: FileConsentMedia;
    conversationId: string;
    description?: string;
}): FileConsentActivityResult;
/**
 * Check if a file requires FileConsentCard flow.
 * True for: personal chat AND (large file OR non-image)
 */
export declare function requiresFileConsent(params: {
    conversationType: string | undefined;
    contentType: string | undefined;
    bufferSize: number;
    thresholdBytes: number;
}): boolean;
