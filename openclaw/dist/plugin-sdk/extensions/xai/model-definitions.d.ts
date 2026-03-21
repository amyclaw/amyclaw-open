import type { ModelDefinitionConfig } from "openclaw/plugin-sdk/provider-models";
export declare const XAI_BASE_URL = "https://api.x.ai/v1";
export declare const XAI_DEFAULT_MODEL_ID = "grok-4";
export declare const XAI_DEFAULT_MODEL_REF = "xai/grok-4";
export declare const XAI_DEFAULT_CONTEXT_WINDOW = 131072;
export declare const XAI_DEFAULT_MAX_TOKENS = 8192;
export declare const XAI_DEFAULT_COST: {
    input: number;
    output: number;
    cacheRead: number;
    cacheWrite: number;
};
export declare function buildXaiModelDefinition(): ModelDefinitionConfig;
