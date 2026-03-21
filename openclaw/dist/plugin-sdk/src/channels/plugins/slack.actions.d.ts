import type { AgentToolResult } from "@mariozechner/pi-agent-core";
import type { ChannelMessageActionAdapter } from "./types.js";
type SlackActionInvoke = (action: Record<string, unknown>, cfg: unknown, toolContext: unknown) => Promise<AgentToolResult<unknown>>;
export declare function createSlackActions(providerId: string, options?: {
    invoke?: SlackActionInvoke;
}): ChannelMessageActionAdapter;
export {};
