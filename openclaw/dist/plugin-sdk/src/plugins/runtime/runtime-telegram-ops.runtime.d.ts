import { auditTelegramGroupMembership as auditTelegramGroupMembershipImpl } from "../../../extensions/telegram/src/audit.js";
import { monitorTelegramProvider as monitorTelegramProviderImpl } from "../../../extensions/telegram/src/monitor.js";
import { probeTelegram as probeTelegramImpl } from "../../../extensions/telegram/src/probe.js";
import { deleteMessageTelegram as deleteMessageTelegramImpl, editMessageReplyMarkupTelegram as editMessageReplyMarkupTelegramImpl, editMessageTelegram as editMessageTelegramImpl, pinMessageTelegram as pinMessageTelegramImpl, renameForumTopicTelegram as renameForumTopicTelegramImpl, sendMessageTelegram as sendMessageTelegramImpl, sendPollTelegram as sendPollTelegramImpl, sendTypingTelegram as sendTypingTelegramImpl, unpinMessageTelegram as unpinMessageTelegramImpl } from "../../../extensions/telegram/src/send.js";
export declare const runtimeTelegramOps: {
    auditGroupMembership: typeof auditTelegramGroupMembershipImpl;
    probeTelegram: typeof probeTelegramImpl;
    sendMessageTelegram: typeof sendMessageTelegramImpl;
    sendPollTelegram: typeof sendPollTelegramImpl;
    monitorTelegramProvider: typeof monitorTelegramProviderImpl;
    typing: {
        pulse: typeof sendTypingTelegramImpl;
    };
    conversationActions: {
        editMessage: typeof editMessageTelegramImpl;
        editReplyMarkup: typeof editMessageReplyMarkupTelegramImpl;
        deleteMessage: typeof deleteMessageTelegramImpl;
        renameTopic: typeof renameForumTopicTelegramImpl;
        pinMessage: typeof pinMessageTelegramImpl;
        unpinMessage: typeof unpinMessageTelegramImpl;
    };
};
