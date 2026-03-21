/**
 * FileConsentCard utilities for MS Teams large file uploads (>4MB) in personal chats.
 *
 * Teams requires user consent before the bot can upload large files. This module provides
 * utilities for:
 * - Building FileConsentCard attachments (to request upload permission)
 * - Building FileInfoCard attachments (to confirm upload completion)
 * - Parsing fileConsent/invoke activities
 */
export interface FileConsentCardParams {
    filename: string;
    description?: string;
    sizeInBytes: number;
    /** Custom context data to include in the card (passed back in the invoke) */
    context?: Record<string, unknown>;
}
export interface FileInfoCardParams {
    filename: string;
    contentUrl: string;
    uniqueId: string;
    fileType: string;
}
/**
 * Build a FileConsentCard attachment for requesting upload permission.
 * Use this for files >= 4MB in personal (1:1) chats.
 */
export declare function buildFileConsentCard(params: FileConsentCardParams): {
    contentType: string;
    name: string;
    content: {
        description: string;
        sizeInBytes: number;
        acceptContext: {
            filename: string;
        };
        declineContext: {
            filename: string;
        };
    };
};
/**
 * Build a FileInfoCard attachment for confirming upload completion.
 * Send this after successfully uploading the file to the consent URL.
 */
export declare function buildFileInfoCard(params: FileInfoCardParams): {
    contentType: string;
    contentUrl: string;
    name: string;
    content: {
        uniqueId: string;
        fileType: string;
    };
};
export interface FileConsentUploadInfo {
    name: string;
    uploadUrl: string;
    contentUrl: string;
    uniqueId: string;
    fileType: string;
}
export interface FileConsentResponse {
    action: "accept" | "decline";
    uploadInfo?: FileConsentUploadInfo;
    context?: Record<string, unknown>;
}
/**
 * Parse a fileConsent/invoke activity.
 * Returns null if the activity is not a file consent invoke.
 */
export declare function parseFileConsentInvoke(activity: {
    name?: string;
    value?: unknown;
}): FileConsentResponse | null;
/**
 * Upload a file to the consent URL provided by Teams.
 * The URL is provided in the fileConsent/invoke response after user accepts.
 */
export declare function uploadToConsentUrl(params: {
    url: string;
    buffer: Buffer;
    contentType?: string;
    fetchFn?: typeof fetch;
}): Promise<void>;
