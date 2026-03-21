import { listSlackDirectoryGroupsLive as listSlackDirectoryGroupsLiveImpl, listSlackDirectoryPeersLive as listSlackDirectoryPeersLiveImpl } from "../../../extensions/slack/src/directory-live.js";
import { monitorSlackProvider as monitorSlackProviderImpl } from "../../../extensions/slack/src/index.js";
import { probeSlack as probeSlackImpl } from "../../../extensions/slack/src/probe.js";
import { resolveSlackChannelAllowlist as resolveSlackChannelAllowlistImpl } from "../../../extensions/slack/src/resolve-channels.js";
import { resolveSlackUserAllowlist as resolveSlackUserAllowlistImpl } from "../../../extensions/slack/src/resolve-users.js";
import { sendMessageSlack as sendMessageSlackImpl } from "../../../extensions/slack/src/send.js";
import { handleSlackAction as handleSlackActionImpl } from "../../agents/tools/slack-actions.js";
export declare const runtimeSlackOps: {
    listDirectoryGroupsLive: typeof listSlackDirectoryGroupsLiveImpl;
    listDirectoryPeersLive: typeof listSlackDirectoryPeersLiveImpl;
    probeSlack: typeof probeSlackImpl;
    resolveChannelAllowlist: typeof resolveSlackChannelAllowlistImpl;
    resolveUserAllowlist: typeof resolveSlackUserAllowlistImpl;
    sendMessageSlack: typeof sendMessageSlackImpl;
    monitorSlackProvider: typeof monitorSlackProviderImpl;
    handleSlackAction: typeof handleSlackActionImpl;
};
