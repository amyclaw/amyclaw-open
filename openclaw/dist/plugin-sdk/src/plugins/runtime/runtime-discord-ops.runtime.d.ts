import { auditDiscordChannelPermissions as auditDiscordChannelPermissionsImpl } from "../../../extensions/discord/src/audit.js";
import { listDiscordDirectoryGroupsLive as listDiscordDirectoryGroupsLiveImpl, listDiscordDirectoryPeersLive as listDiscordDirectoryPeersLiveImpl } from "../../../extensions/discord/src/directory-live.js";
import { monitorDiscordProvider as monitorDiscordProviderImpl } from "../../../extensions/discord/src/monitor.js";
import { probeDiscord as probeDiscordImpl } from "../../../extensions/discord/src/probe.js";
import { resolveDiscordChannelAllowlist as resolveDiscordChannelAllowlistImpl } from "../../../extensions/discord/src/resolve-channels.js";
import { resolveDiscordUserAllowlist as resolveDiscordUserAllowlistImpl } from "../../../extensions/discord/src/resolve-users.js";
import { createThreadDiscord as createThreadDiscordImpl, deleteMessageDiscord as deleteMessageDiscordImpl, editChannelDiscord as editChannelDiscordImpl, editMessageDiscord as editMessageDiscordImpl, pinMessageDiscord as pinMessageDiscordImpl, sendDiscordComponentMessage as sendDiscordComponentMessageImpl, sendMessageDiscord as sendMessageDiscordImpl, sendPollDiscord as sendPollDiscordImpl, sendTypingDiscord as sendTypingDiscordImpl, unpinMessageDiscord as unpinMessageDiscordImpl } from "../../../extensions/discord/src/send.js";
export declare const runtimeDiscordOps: {
    auditChannelPermissions: typeof auditDiscordChannelPermissionsImpl;
    listDirectoryGroupsLive: typeof listDiscordDirectoryGroupsLiveImpl;
    listDirectoryPeersLive: typeof listDiscordDirectoryPeersLiveImpl;
    probeDiscord: typeof probeDiscordImpl;
    resolveChannelAllowlist: typeof resolveDiscordChannelAllowlistImpl;
    resolveUserAllowlist: typeof resolveDiscordUserAllowlistImpl;
    sendComponentMessage: typeof sendDiscordComponentMessageImpl;
    sendMessageDiscord: typeof sendMessageDiscordImpl;
    sendPollDiscord: typeof sendPollDiscordImpl;
    monitorDiscordProvider: typeof monitorDiscordProviderImpl;
    typing: {
        pulse: typeof sendTypingDiscordImpl;
    };
    conversationActions: {
        editMessage: typeof editMessageDiscordImpl;
        deleteMessage: typeof deleteMessageDiscordImpl;
        pinMessage: typeof pinMessageDiscordImpl;
        unpinMessage: typeof unpinMessageDiscordImpl;
        createThread: typeof createThreadDiscordImpl;
        editChannel: typeof editChannelDiscordImpl;
    };
};
