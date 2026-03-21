/**
 * Native Teams file card attachments for Bot Framework.
 *
 * The Bot Framework SDK supports `application/vnd.microsoft.teams.card.file.info`
 * content type which produces native Teams file cards.
 *
 * @see https://learn.microsoft.com/en-us/microsoftteams/platform/bots/how-to/bots-filesv4
 */
import type { DriveItemProperties } from "./graph-upload.js";
/**
 * Build a native Teams file card attachment for Bot Framework.
 *
 * This uses the `application/vnd.microsoft.teams.card.file.info` content type
 * which is supported by Bot Framework and produces native Teams file cards
 * (the same display as when a user manually shares a file).
 *
 * @param file - DriveItem properties from getDriveItemProperties()
 * @returns Attachment object for Bot Framework sendActivity()
 */
export declare function buildTeamsFileInfoCard(file: DriveItemProperties): {
    contentType: string;
    contentUrl: string;
    name: string;
    content: {
        uniqueId: string;
        fileType: string;
    };
};
