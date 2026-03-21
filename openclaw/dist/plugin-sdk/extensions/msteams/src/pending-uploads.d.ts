/**
 * In-memory storage for files awaiting user consent in the FileConsentCard flow.
 *
 * When sending large files (>=4MB) in personal chats, Teams requires user consent
 * before upload. This module stores the file data temporarily until the user
 * accepts or declines, or until the TTL expires.
 */
export interface PendingUpload {
    id: string;
    buffer: Buffer;
    filename: string;
    contentType?: string;
    conversationId: string;
    createdAt: number;
}
/**
 * Store a file pending user consent.
 * Returns the upload ID to include in the FileConsentCard context.
 */
export declare function storePendingUpload(upload: Omit<PendingUpload, "id" | "createdAt">): string;
/**
 * Retrieve a pending upload by ID.
 * Returns undefined if not found or expired.
 */
export declare function getPendingUpload(id?: string): PendingUpload | undefined;
/**
 * Remove a pending upload (after successful upload or user decline).
 */
export declare function removePendingUpload(id?: string): void;
/**
 * Get the count of pending uploads (for monitoring/debugging).
 */
export declare function getPendingUploadCount(): number;
/**
 * Clear all pending uploads (for testing).
 */
export declare function clearPendingUploads(): void;
