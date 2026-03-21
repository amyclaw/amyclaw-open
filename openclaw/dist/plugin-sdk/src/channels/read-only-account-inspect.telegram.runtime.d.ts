export type { InspectedTelegramAccount } from "../plugin-sdk/telegram.js";
type InspectTelegramAccount = typeof import("../plugin-sdk/telegram.js").inspectTelegramAccount;
export declare function inspectTelegramAccount(...args: Parameters<InspectTelegramAccount>): ReturnType<InspectTelegramAccount>;
