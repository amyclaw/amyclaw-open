/**
 * Twitch-specific utility functions
 */
/**
 * Normalize Twitch channel names.
 *
 * Removes the '#' prefix if present, converts to lowercase, and trims whitespace.
 * Twitch channel names are case-insensitive and don't use the '#' prefix in the API.
 *
 * @param channel - The channel name to normalize
 * @returns Normalized channel name
 *
 * @example
 * normalizeTwitchChannel("#TwitchChannel") // "twitchchannel"
 * normalizeTwitchChannel("MyChannel") // "mychannel"
 */
export declare function normalizeTwitchChannel(channel: string): string;
/**
 * Create a standardized error message for missing target.
 *
 * @param provider - The provider name (e.g., "Twitch")
 * @param hint - Optional hint for how to fix the issue
 * @returns Error object with descriptive message
 */
export declare function missingTargetError(provider: string, hint?: string): Error;
/**
 * Generate a unique message ID for Twitch messages.
 *
 * Twurple's say() doesn't return the message ID, so we generate one
 * for tracking purposes.
 *
 * @returns A unique message ID
 */
export declare function generateMessageId(): string;
/**
 * Normalize OAuth token by removing the "oauth:" prefix if present.
 *
 * Twurple doesn't require the "oauth:" prefix, so we strip it for consistency.
 *
 * @param token - The OAuth token to normalize
 * @returns Normalized token without "oauth:" prefix
 *
 * @example
 * normalizeToken("oauth:abc123") // "abc123"
 * normalizeToken("abc123") // "abc123"
 */
export declare function normalizeToken(token: string): string;
/**
 * Check if an account is properly configured with required credentials.
 *
 * @param account - The Twitch account config to check
 * @returns true if the account has required credentials
 */
export declare function isAccountConfigured(account: {
    username?: string;
    accessToken?: string;
    clientId?: string;
}, resolvedToken?: string | null): boolean;
