import type { OpenClawConfig } from "../config/config.js";
export declare const GOOGLE_GEMINI_DEFAULT_MODEL = "google/gemini-3.1-pro-preview";
export declare const OPENAI_DEFAULT_MODEL = "openai/gpt-5.1-codex";
export declare const OPENCODE_GO_DEFAULT_MODEL_REF = "opencode-go/kimi-k2.5";
export declare const OPENCODE_ZEN_DEFAULT_MODEL = "opencode/claude-opus-4-6";
export declare function applyGoogleGeminiModelDefault(cfg: OpenClawConfig): {
    next: OpenClawConfig;
    changed: boolean;
};
export declare function applyOpenAIProviderConfig(cfg: OpenClawConfig): OpenClawConfig;
export declare function applyOpenAIConfig(cfg: OpenClawConfig): OpenClawConfig;
export declare function applyOpencodeGoModelDefault(cfg: OpenClawConfig): {
    next: OpenClawConfig;
    changed: boolean;
};
export declare function applyOpencodeZenModelDefault(cfg: OpenClawConfig): {
    next: OpenClawConfig;
    changed: boolean;
};
