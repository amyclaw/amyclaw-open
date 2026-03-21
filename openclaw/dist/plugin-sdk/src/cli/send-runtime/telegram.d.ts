import { sendMessageTelegram as sendMessageTelegramImpl } from "../../plugin-sdk/telegram.js";
export declare const runtimeSend: {
    sendMessage: typeof sendMessageTelegramImpl;
};
