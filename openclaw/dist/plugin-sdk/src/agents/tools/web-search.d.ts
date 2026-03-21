import type { OpenClawConfig } from "../../config/config.js";
import type { RuntimeWebSearchMetadata } from "../../secrets/runtime-web-tools.types.js";
import type { AnyAgentTool } from "./common.js";
export declare function createWebSearchTool(options?: {
    config?: OpenClawConfig;
    sandboxed?: boolean;
    runtimeWebSearch?: RuntimeWebSearchMetadata;
}): AnyAgentTool | null;
export declare const __testing: {
    resolveSearchProvider: (search?: OpenClawConfig["tools"] extends infer Tools ? Tools extends {
        web?: infer Web;
    } ? Web extends {
        search?: infer Search;
    } ? Search : undefined : undefined : undefined) => string;
    inferPerplexityBaseUrlFromApiKey: (apiKey?: string) => ("direct" | "openrouter") | undefined;
    resolvePerplexityBaseUrl: (perplexity?: {
        apiKey?: string;
        baseUrl?: string;
        model?: string;
    }, authSource?: "none" | "config" | "perplexity_env" | "openrouter_env", configuredKey?: string) => string;
    resolvePerplexityModel: (perplexity?: {
        apiKey?: string;
        baseUrl?: string;
        model?: string;
    }) => string;
    resolvePerplexityTransport: (perplexity?: {
        apiKey?: string;
        baseUrl?: string;
        model?: string;
    }) => {
        apiKey?: string;
        source: "none" | "config" | "perplexity_env" | "openrouter_env";
        baseUrl: string;
        model: string;
        transport: "search_api" | "chat_completions";
    };
    isDirectPerplexityBaseUrl: (baseUrl: string) => boolean;
    resolvePerplexityRequestModel: (baseUrl: string, model: string) => string;
    resolvePerplexityApiKey: (perplexity?: {
        apiKey?: string;
        baseUrl?: string;
        model?: string;
    }) => {
        apiKey?: string;
        source: "none" | "config" | "perplexity_env" | "openrouter_env";
    };
    normalizeBraveLanguageParams: (params: {
        search_lang?: string;
        ui_lang?: string;
    }) => {
        search_lang?: string;
        ui_lang?: string;
        invalidField?: "search_lang" | "ui_lang";
    };
    normalizeFreshness: (value: string | undefined, provider: "gemini" | "brave" | "grok" | "kimi" | "perplexity") => string | undefined;
    normalizeToIsoDate: (value: string) => string | undefined;
    isoToPerplexityDate: (iso: string) => string | undefined;
    SEARCH_CACHE: Map<string, import("./web-shared.ts").CacheEntry<Record<string, unknown>>>;
    FRESHNESS_TO_RECENCY: Record<string, string>;
    RECENCY_TO_FRESHNESS: Record<string, string>;
    resolveGrokApiKey: (grok?: {
        apiKey?: string;
        model?: string;
        inlineCitations?: boolean;
    }) => string | undefined;
    resolveGrokModel: (grok?: {
        apiKey?: string;
        model?: string;
        inlineCitations?: boolean;
    }) => string;
    resolveGrokInlineCitations: (grok?: {
        apiKey?: string;
        model?: string;
        inlineCitations?: boolean;
    }) => boolean;
    extractGrokContent: (data: {
        output?: Array<{
            type?: string;
            role?: string;
            text?: string;
            content?: Array<{
                type?: string;
                text?: string;
                annotations?: Array<{
                    type?: string;
                    url?: string;
                    start_index?: number;
                    end_index?: number;
                }>;
            }>;
            annotations?: Array<{
                type?: string;
                url?: string;
                start_index?: number;
                end_index?: number;
            }>;
        }>;
        output_text?: string;
        citations?: string[];
        inline_citations?: Array<{
            start_index: number;
            end_index: number;
            url: string;
        }>;
    }) => {
        text: string | undefined;
        annotationCitations: string[];
    };
    resolveKimiApiKey: (kimi?: {
        apiKey?: string;
        baseUrl?: string;
        model?: string;
    }) => string | undefined;
    resolveKimiModel: (kimi?: {
        apiKey?: string;
        baseUrl?: string;
        model?: string;
    }) => string;
    resolveKimiBaseUrl: (kimi?: {
        apiKey?: string;
        baseUrl?: string;
        model?: string;
    }) => string;
    extractKimiCitations: (data: {
        choices?: Array<{
            finish_reason?: string;
            message?: {
                role?: string;
                content?: string;
                reasoning_content?: string;
                tool_calls?: {
                    id?: string;
                    type?: string;
                    function?: {
                        name?: string;
                        arguments?: string;
                    };
                }[];
            };
        }>;
        search_results?: Array<{
            title?: string;
            url?: string;
            content?: string;
        }>;
    }) => string[];
    resolveRedirectUrl: typeof import("./web-search-citation-redirect.ts").resolveCitationRedirectUrl;
    resolveBraveMode: (brave: {
        mode?: string;
    }) => "web" | "llm-context";
    mapBraveLlmContextResults: (data: {
        grounding: {
            generic?: {
                url: string;
                title: string;
                snippets: string[];
            }[];
        };
        sources?: {
            url?: string;
            hostname?: string;
            date?: string;
        }[];
    }) => {
        url: string;
        title: string;
        snippets: string[];
        siteName?: string;
    }[];
};
