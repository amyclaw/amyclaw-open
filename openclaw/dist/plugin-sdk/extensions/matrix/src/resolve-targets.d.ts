import type { ChannelResolveKind, ChannelResolveResult, RuntimeEnv } from "openclaw/plugin-sdk/matrix";
export declare function resolveMatrixTargets(params: {
    cfg: unknown;
    inputs: string[];
    kind: ChannelResolveKind;
    runtime?: RuntimeEnv;
}): Promise<ChannelResolveResult[]>;
