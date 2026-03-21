import type { StreamFn } from "@mariozechner/pi-agent-core";
/**
 * Inject `tool_stream=true` for Z.AI requests so tool-call deltas stream in
 * real time. Providers can disable this by setting `params.tool_stream=false`.
 */
export declare function createZaiToolStreamWrapper(baseStreamFn: StreamFn | undefined, enabled: boolean): StreamFn;
