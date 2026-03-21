import { sendMessageWhatsApp as sendMessageWhatsAppImpl, sendPollWhatsApp as sendPollWhatsAppImpl } from "../../../extensions/whatsapp/src/send.js";
export declare const runtimeWhatsAppOutbound: {
    sendMessageWhatsApp: typeof sendMessageWhatsAppImpl;
    sendPollWhatsApp: typeof sendPollWhatsAppImpl;
};
