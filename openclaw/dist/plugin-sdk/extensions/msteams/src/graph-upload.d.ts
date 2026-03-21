/**
 * OneDrive/SharePoint upload utilities for MS Teams file sending.
 *
 * For group chats and channels, files are uploaded to SharePoint and shared via a link.
 * This module provides utilities for:
 * - Uploading files to OneDrive (personal scope - now deprecated for bot use)
 * - Uploading files to SharePoint (group/channel scope)
 * - Creating sharing links (organization-wide or per-user)
 * - Getting chat members for per-user sharing
 */
import type { MSTeamsAccessTokenProvider } from "./attachments/types.js";
export interface OneDriveUploadResult {
    id: string;
    webUrl: string;
    name: string;
}
/**
 * Upload a file to the user's OneDrive root folder.
 * For larger files, this uses the simple upload endpoint (up to 4MB).
 */
export declare function uploadToOneDrive(params: {
    buffer: Buffer;
    filename: string;
    contentType?: string;
    tokenProvider: MSTeamsAccessTokenProvider;
    fetchFn?: typeof fetch;
}): Promise<OneDriveUploadResult>;
export interface OneDriveSharingLink {
    webUrl: string;
}
/**
 * Create a sharing link for a OneDrive file.
 * The link allows organization members to view the file.
 */
export declare function createSharingLink(params: {
    itemId: string;
    tokenProvider: MSTeamsAccessTokenProvider;
    /** Sharing scope: "organization" (default) or "anonymous" */
    scope?: "organization" | "anonymous";
    fetchFn?: typeof fetch;
}): Promise<OneDriveSharingLink>;
/**
 * Upload a file to OneDrive and create a sharing link.
 * Convenience function for the common case.
 */
export declare function uploadAndShareOneDrive(params: {
    buffer: Buffer;
    filename: string;
    contentType?: string;
    tokenProvider: MSTeamsAccessTokenProvider;
    scope?: "organization" | "anonymous";
    fetchFn?: typeof fetch;
}): Promise<{
    itemId: string;
    webUrl: string;
    shareUrl: string;
    name: string;
}>;
/**
 * Upload a file to a SharePoint site.
 * This is used for group chats and channels where /me/drive doesn't work for bots.
 *
 * @param params.siteId - SharePoint site ID (e.g., "contoso.sharepoint.com,guid1,guid2")
 */
export declare function uploadToSharePoint(params: {
    buffer: Buffer;
    filename: string;
    contentType?: string;
    tokenProvider: MSTeamsAccessTokenProvider;
    siteId: string;
    fetchFn?: typeof fetch;
}): Promise<OneDriveUploadResult>;
export interface ChatMember {
    aadObjectId: string;
    displayName?: string;
}
/**
 * Properties needed for native Teams file card attachments.
 * The eTag is used as the attachment ID and webDavUrl as the contentUrl.
 */
export interface DriveItemProperties {
    /** The eTag of the driveItem (used as attachment ID) */
    eTag: string;
    /** The WebDAV URL of the driveItem (used as contentUrl for reference attachment) */
    webDavUrl: string;
    /** The filename */
    name: string;
}
/**
 * Get driveItem properties needed for native Teams file card attachments.
 * This fetches the eTag and webDavUrl which are required for "reference" type attachments.
 *
 * @param params.siteId - SharePoint site ID
 * @param params.itemId - The driveItem ID (returned from upload)
 */
export declare function getDriveItemProperties(params: {
    siteId: string;
    itemId: string;
    tokenProvider: MSTeamsAccessTokenProvider;
    fetchFn?: typeof fetch;
}): Promise<DriveItemProperties>;
/**
 * Get members of a Teams chat for per-user sharing.
 * Used to create sharing links scoped to only the chat participants.
 */
export declare function getChatMembers(params: {
    chatId: string;
    tokenProvider: MSTeamsAccessTokenProvider;
    fetchFn?: typeof fetch;
}): Promise<ChatMember[]>;
/**
 * Create a sharing link for a SharePoint drive item.
 * For organization scope (default), uses v1.0 API.
 * For per-user scope, uses beta API with recipients.
 */
export declare function createSharePointSharingLink(params: {
    siteId: string;
    itemId: string;
    tokenProvider: MSTeamsAccessTokenProvider;
    /** Sharing scope: "organization" (default) or "users" (per-user with recipients) */
    scope?: "organization" | "users";
    /** Required when scope is "users": AAD object IDs of recipients */
    recipientObjectIds?: string[];
    fetchFn?: typeof fetch;
}): Promise<OneDriveSharingLink>;
/**
 * Upload a file to SharePoint and create a sharing link.
 *
 * For group chats, this creates a per-user sharing link scoped to chat members.
 * For channels, this creates an organization-wide sharing link.
 *
 * @param params.siteId - SharePoint site ID
 * @param params.chatId - Optional chat ID for per-user sharing (group chats)
 * @param params.usePerUserSharing - Whether to use per-user sharing (requires beta API + Chat.Read.All)
 */
export declare function uploadAndShareSharePoint(params: {
    buffer: Buffer;
    filename: string;
    contentType?: string;
    tokenProvider: MSTeamsAccessTokenProvider;
    siteId: string;
    chatId?: string;
    usePerUserSharing?: boolean;
    fetchFn?: typeof fetch;
}): Promise<{
    itemId: string;
    webUrl: string;
    shareUrl: string;
    name: string;
}>;
