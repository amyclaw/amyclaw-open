import { sendMessageWhatsApp as sendMessageWhatsAppImpl } from "../../plugin-sdk/whatsapp.js";
export declare const runtimeSend: {
    sendMessage: typeof sendMessageWhatsAppImpl;
};
