import type { ClawdbotConfig } from "openclaw/plugin-sdk/feishu";
export declare function resolveFeishuSendTarget(params: {
    cfg: ClawdbotConfig;
    to: string;
    accountId?: string;
}): {
    client: import("@larksuiteoapi/node-sdk").Client;
    receiveId: string;
    receiveIdType: "chat_id" | "open_id" | "user_id";
};
