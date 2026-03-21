/**
 * MS Teams mention handling utilities.
 *
 * Mentions in Teams require:
 * 1. Text containing <at>Name</at> tags
 * 2. entities array with mention metadata
 */
export type MentionEntity = {
    type: "mention";
    text: string;
    mentioned: {
        id: string;
        name: string;
    };
};
export type MentionInfo = {
    /** User/bot ID (e.g., "28:xxx" or AAD object ID) */
    id: string;
    /** Display name */
    name: string;
};
/**
 * Parse mentions from text in the format @[Name](id).
 * Example: "Hello @[John Doe](28:xxx-yyy-zzz)!"
 *
 * Only matches where the id looks like a real Teams user/bot ID are treated
 * as mentions. This avoids false positives from documentation or code samples
 * embedded in the message (e.g. `@[表示名](ユーザーID)` in backticks).
 *
 * Returns both the formatted text with <at> tags and the entities array.
 */
export declare function parseMentions(text: string): {
    text: string;
    entities: MentionEntity[];
};
/**
 * Build mention entities array from a list of mentions.
 * Use this when you already have the mention info and formatted text.
 */
export declare function buildMentionEntities(mentions: MentionInfo[]): MentionEntity[];
/**
 * Format text with mentions using <at> tags.
 * This is a convenience function when you want to manually format mentions.
 */
export declare function formatMentionText(text: string, mentions: MentionInfo[]): string;
