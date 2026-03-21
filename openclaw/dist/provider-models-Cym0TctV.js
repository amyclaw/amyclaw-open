import { t as createSubsystemLogger } from "./subsystem-MGyxt_Bl.js";
import { C as sleep } from "./utils-BMtC0Ocd.js";
import { o as ensureModelAllowlistEntry, r as applyProviderConfigWithDefaultModel, t as applyAgentDefaultModelPrimary } from "./provider-onboard-dAr3NUh2.js";
//#region src/infra/retry.ts
const DEFAULT_RETRY_CONFIG = {
	attempts: 3,
	minDelayMs: 300,
	maxDelayMs: 3e4,
	jitter: 0
};
const asFiniteNumber = (value) => typeof value === "number" && Number.isFinite(value) ? value : void 0;
const clampNumber = (value, fallback, min, max) => {
	const next = asFiniteNumber(value);
	if (next === void 0) return fallback;
	const floor = typeof min === "number" ? min : Number.NEGATIVE_INFINITY;
	const ceiling = typeof max === "number" ? max : Number.POSITIVE_INFINITY;
	return Math.min(Math.max(next, floor), ceiling);
};
function resolveRetryConfig(defaults = DEFAULT_RETRY_CONFIG, overrides) {
	const attempts = Math.max(1, Math.round(clampNumber(overrides?.attempts, defaults.attempts, 1)));
	const minDelayMs = Math.max(0, Math.round(clampNumber(overrides?.minDelayMs, defaults.minDelayMs, 0)));
	return {
		attempts,
		minDelayMs,
		maxDelayMs: Math.max(minDelayMs, Math.round(clampNumber(overrides?.maxDelayMs, defaults.maxDelayMs, 0))),
		jitter: clampNumber(overrides?.jitter, defaults.jitter, 0, 1)
	};
}
function applyJitter(delayMs, jitter) {
	if (jitter <= 0) return delayMs;
	const offset = (Math.random() * 2 - 1) * jitter;
	return Math.max(0, Math.round(delayMs * (1 + offset)));
}
async function retryAsync(fn, attemptsOrOptions = 3, initialDelayMs = 300) {
	if (typeof attemptsOrOptions === "number") {
		const attempts = Math.max(1, Math.round(attemptsOrOptions));
		let lastErr;
		for (let i = 0; i < attempts; i += 1) try {
			return await fn();
		} catch (err) {
			lastErr = err;
			if (i === attempts - 1) break;
			await sleep(initialDelayMs * 2 ** i);
		}
		throw lastErr ?? /* @__PURE__ */ new Error("Retry failed");
	}
	const options = attemptsOrOptions;
	const resolved = resolveRetryConfig(DEFAULT_RETRY_CONFIG, options);
	const maxAttempts = resolved.attempts;
	const minDelayMs = resolved.minDelayMs;
	const maxDelayMs = Number.isFinite(resolved.maxDelayMs) && resolved.maxDelayMs > 0 ? resolved.maxDelayMs : Number.POSITIVE_INFINITY;
	const jitter = resolved.jitter;
	const shouldRetry = options.shouldRetry ?? (() => true);
	let lastErr;
	for (let attempt = 1; attempt <= maxAttempts; attempt += 1) try {
		return await fn();
	} catch (err) {
		lastErr = err;
		if (attempt >= maxAttempts || !shouldRetry(err, attempt)) break;
		const retryAfterMs = options.retryAfterMs?.(err);
		const baseDelay = typeof retryAfterMs === "number" && Number.isFinite(retryAfterMs) ? Math.max(retryAfterMs, minDelayMs) : minDelayMs * 2 ** (attempt - 1);
		let delay = Math.min(baseDelay, maxDelayMs);
		delay = applyJitter(delay, jitter);
		delay = Math.min(Math.max(delay, minDelayMs), maxDelayMs);
		options.onRetry?.({
			attempt,
			maxAttempts,
			delayMs: delay,
			err,
			label: options.label
		});
		await sleep(delay);
	}
	throw lastErr ?? /* @__PURE__ */ new Error("Retry failed");
}
//#endregion
//#region src/providers/kilocode-shared.ts
const KILOCODE_BASE_URL = "https://api.kilo.ai/api/gateway/";
const KILOCODE_DEFAULT_MODEL_ID = "kilo/auto";
const KILOCODE_DEFAULT_MODEL_REF = `kilocode/${KILOCODE_DEFAULT_MODEL_ID}`;
const KILOCODE_DEFAULT_MODEL_NAME = "Kilo Auto";
/**
* Static fallback catalog — used by the sync setup path and as a
* fallback when dynamic model discovery from the gateway API fails.
* The full model list is fetched dynamically by {@link discoverKilocodeModels}
* in `src/agents/kilocode-models.ts`.
*/
const KILOCODE_MODEL_CATALOG = [{
	id: KILOCODE_DEFAULT_MODEL_ID,
	name: KILOCODE_DEFAULT_MODEL_NAME,
	reasoning: true,
	input: ["text", "image"],
	contextWindow: 1e6,
	maxTokens: 128e3
}];
const KILOCODE_DEFAULT_CONTEXT_WINDOW = 1e6;
const KILOCODE_DEFAULT_MAX_TOKENS = 128e3;
const KILOCODE_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
//#endregion
//#region src/agents/model-compat.ts
function isOpenAiCompletionsModel(model) {
	return model.api === "openai-completions";
}
/**
* Returns true only for endpoints that are confirmed to be native OpenAI
* infrastructure and therefore accept the `developer` message role.
* Azure OpenAI uses the Chat Completions API and does NOT accept `developer`.
* All other openai-completions backends (proxies, Qwen, GLM, DeepSeek, etc.)
* only support the standard `system` role.
*/
function isOpenAINativeEndpoint(baseUrl) {
	try {
		return new URL(baseUrl).hostname.toLowerCase() === "api.openai.com";
	} catch {
		return false;
	}
}
function isAnthropicMessagesModel(model) {
	return model.api === "anthropic-messages";
}
/**
* pi-ai constructs the Anthropic API endpoint as `${baseUrl}/v1/messages`.
* If a user configures `baseUrl` with a trailing `/v1` (e.g. the previously
* recommended format "https://api.anthropic.com/v1"), the resulting URL
* becomes "…/v1/v1/messages" which the Anthropic API rejects with a 404.
*
* Strip a single trailing `/v1` (with optional trailing slash) from the
* baseUrl for anthropic-messages models so users with either format work.
*/
function normalizeAnthropicBaseUrl(baseUrl) {
	return baseUrl.replace(/\/v1\/?$/, "");
}
function normalizeModelCompat(model) {
	const baseUrl = model.baseUrl ?? "";
	if (isAnthropicMessagesModel(model) && baseUrl) {
		const normalised = normalizeAnthropicBaseUrl(baseUrl);
		if (normalised !== baseUrl) return {
			...model,
			baseUrl: normalised
		};
	}
	if (!isOpenAiCompletionsModel(model)) return model;
	const compat = model.compat ?? void 0;
	if (!(baseUrl ? !isOpenAINativeEndpoint(baseUrl) : false)) return model;
	const forcedDeveloperRole = compat?.supportsDeveloperRole === true;
	const hasStreamingUsageOverride = compat?.supportsUsageInStreaming !== void 0;
	const targetStrictMode = compat?.supportsStrictMode ?? false;
	if (compat?.supportsDeveloperRole !== void 0 && hasStreamingUsageOverride && compat?.supportsStrictMode !== void 0) return model;
	return {
		...model,
		compat: compat ? {
			...compat,
			supportsDeveloperRole: forcedDeveloperRole || false,
			...hasStreamingUsageOverride ? {} : { supportsUsageInStreaming: false },
			supportsStrictMode: targetStrictMode
		} : {
			supportsDeveloperRole: false,
			supportsUsageInStreaming: false,
			supportsStrictMode: false
		}
	};
}
//#endregion
//#region src/plugins/provider-model-helpers.ts
function cloneFirstTemplateModel(params) {
	const trimmedModelId = params.modelId.trim();
	for (const templateId of [...new Set(params.templateIds)].filter(Boolean)) {
		const template = params.ctx.modelRegistry.find(params.providerId, templateId);
		if (!template) continue;
		return normalizeModelCompat({
			...template,
			id: trimmedModelId,
			name: trimmedModelId,
			...params.patch
		});
	}
}
//#endregion
//#region src/plugins/provider-model-primary.ts
function resolvePrimaryModel(model) {
	if (typeof model === "string") return model;
	if (model && typeof model === "object" && typeof model.primary === "string") return model.primary;
}
function applyAgentDefaultPrimaryModel(params) {
	const current = resolvePrimaryModel(params.cfg.agents?.defaults?.model)?.trim();
	if ((current && params.legacyModels?.has(current) ? params.model : current) === params.model) return {
		next: params.cfg,
		changed: false
	};
	return {
		next: {
			...params.cfg,
			agents: {
				...params.cfg.agents,
				defaults: {
					...params.cfg.agents?.defaults,
					model: params.cfg.agents?.defaults?.model && typeof params.cfg.agents.defaults.model === "object" ? {
						...params.cfg.agents.defaults.model,
						primary: params.model
					} : { primary: params.model }
				}
			}
		},
		changed: true
	};
}
function applyPrimaryModel(cfg, model) {
	const defaults = cfg.agents?.defaults;
	const existingModel = defaults?.model;
	const existingModels = defaults?.models;
	const fallbacks = typeof existingModel === "object" && existingModel !== null && "fallbacks" in existingModel ? existingModel.fallbacks : void 0;
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...defaults,
				model: {
					...fallbacks ? { fallbacks } : void 0,
					primary: model
				},
				models: {
					...existingModels,
					[model]: existingModels?.[model] ?? {}
				}
			}
		}
	};
}
//#endregion
//#region src/plugins/provider-model-defaults.ts
const GOOGLE_GEMINI_DEFAULT_MODEL = "google/gemini-3.1-pro-preview";
const OPENAI_DEFAULT_MODEL = "openai/gpt-5.1-codex";
const OPENCODE_GO_DEFAULT_MODEL_REF = "opencode-go/kimi-k2.5";
const OPENCODE_ZEN_DEFAULT_MODEL$1 = "opencode/claude-opus-4-6";
function applyGoogleGeminiModelDefault(cfg) {
	return applyAgentDefaultPrimaryModel({
		cfg,
		model: GOOGLE_GEMINI_DEFAULT_MODEL
	});
}
function applyOpenAIProviderConfig(cfg) {
	const next = ensureModelAllowlistEntry({
		cfg,
		modelRef: OPENAI_DEFAULT_MODEL
	});
	const models = { ...next.agents?.defaults?.models };
	models[OPENAI_DEFAULT_MODEL] = {
		...models[OPENAI_DEFAULT_MODEL],
		alias: models["openai/gpt-5.1-codex"]?.alias ?? "GPT"
	};
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				models
			}
		}
	};
}
function applyOpenAIConfig(cfg) {
	const next = applyOpenAIProviderConfig(cfg);
	return {
		...next,
		agents: {
			...next.agents,
			defaults: {
				...next.agents?.defaults,
				model: next.agents?.defaults?.model && typeof next.agents.defaults.model === "object" ? {
					...next.agents.defaults.model,
					primary: OPENAI_DEFAULT_MODEL
				} : { primary: OPENAI_DEFAULT_MODEL }
			}
		}
	};
}
createSubsystemLogger("opencode-zen-models");
const OPENCODE_ZEN_DEFAULT_MODEL_REF = `opencode/claude-opus-4-6`;
//#endregion
//#region extensions/minimax/model-definitions.ts
const DEFAULT_MINIMAX_BASE_URL = "https://api.minimax.io/v1";
const MINIMAX_API_BASE_URL = "https://api.minimax.io/anthropic";
const MINIMAX_CN_API_BASE_URL = "https://api.minimaxi.com/anthropic";
const MINIMAX_HOSTED_MODEL_ID = "MiniMax-M2.5";
const MINIMAX_HOSTED_MODEL_REF = `minimax/${MINIMAX_HOSTED_MODEL_ID}`;
const DEFAULT_MINIMAX_CONTEXT_WINDOW = 2e5;
const DEFAULT_MINIMAX_MAX_TOKENS = 8192;
const MINIMAX_API_COST = {
	input: .3,
	output: 1.2,
	cacheRead: .03,
	cacheWrite: .12
};
const MINIMAX_HOSTED_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const MINIMAX_LM_STUDIO_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const MINIMAX_MODEL_CATALOG = {
	"MiniMax-M2.5": {
		name: "MiniMax M2.5",
		reasoning: true
	},
	"MiniMax-M2.5-highspeed": {
		name: "MiniMax M2.5 Highspeed",
		reasoning: true
	}
};
function buildMinimaxModelDefinition(params) {
	const catalog = MINIMAX_MODEL_CATALOG[params.id];
	return {
		id: params.id,
		name: params.name ?? catalog?.name ?? `MiniMax ${params.id}`,
		reasoning: params.reasoning ?? catalog?.reasoning ?? false,
		input: ["text"],
		cost: params.cost,
		contextWindow: params.contextWindow,
		maxTokens: params.maxTokens
	};
}
function buildMinimaxApiModelDefinition(modelId) {
	return buildMinimaxModelDefinition({
		id: modelId,
		cost: MINIMAX_API_COST,
		contextWindow: DEFAULT_MINIMAX_CONTEXT_WINDOW,
		maxTokens: DEFAULT_MINIMAX_MAX_TOKENS
	});
}
//#endregion
//#region extensions/mistral/model-definitions.ts
const MISTRAL_BASE_URL = "https://api.mistral.ai/v1";
const MISTRAL_DEFAULT_MODEL_ID = "mistral-large-latest";
const MISTRAL_DEFAULT_MODEL_REF = `mistral/${MISTRAL_DEFAULT_MODEL_ID}`;
const MISTRAL_DEFAULT_CONTEXT_WINDOW = 262144;
const MISTRAL_DEFAULT_MAX_TOKENS = 262144;
const MISTRAL_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
function buildMistralModelDefinition() {
	return {
		id: MISTRAL_DEFAULT_MODEL_ID,
		name: "Mistral Large",
		reasoning: false,
		input: ["text", "image"],
		cost: MISTRAL_DEFAULT_COST,
		contextWindow: MISTRAL_DEFAULT_CONTEXT_WINDOW,
		maxTokens: MISTRAL_DEFAULT_MAX_TOKENS
	};
}
//#endregion
//#region extensions/modelstudio/model-definitions.ts
const MODELSTUDIO_CN_BASE_URL = "https://coding.dashscope.aliyuncs.com/v1";
const MODELSTUDIO_GLOBAL_BASE_URL = "https://coding-intl.dashscope.aliyuncs.com/v1";
const MODELSTUDIO_DEFAULT_MODEL_ID = "qwen3.5-plus";
const MODELSTUDIO_DEFAULT_MODEL_REF = `modelstudio/${MODELSTUDIO_DEFAULT_MODEL_ID}`;
const MODELSTUDIO_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const MODELSTUDIO_MODEL_CATALOG = {
	"qwen3.5-plus": {
		name: "qwen3.5-plus",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 65536
	},
	"qwen3-max-2026-01-23": {
		name: "qwen3-max-2026-01-23",
		reasoning: false,
		input: ["text"],
		contextWindow: 262144,
		maxTokens: 65536
	},
	"qwen3-coder-next": {
		name: "qwen3-coder-next",
		reasoning: false,
		input: ["text"],
		contextWindow: 262144,
		maxTokens: 65536
	},
	"qwen3-coder-plus": {
		name: "qwen3-coder-plus",
		reasoning: false,
		input: ["text"],
		contextWindow: 1e6,
		maxTokens: 65536
	},
	"MiniMax-M2.5": {
		name: "MiniMax-M2.5",
		reasoning: false,
		input: ["text"],
		contextWindow: 1e6,
		maxTokens: 65536
	},
	"glm-5": {
		name: "glm-5",
		reasoning: false,
		input: ["text"],
		contextWindow: 202752,
		maxTokens: 16384
	},
	"glm-4.7": {
		name: "glm-4.7",
		reasoning: false,
		input: ["text"],
		contextWindow: 202752,
		maxTokens: 16384
	},
	"kimi-k2.5": {
		name: "kimi-k2.5",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 262144,
		maxTokens: 32768
	}
};
function buildModelStudioModelDefinition(params) {
	const catalog = MODELSTUDIO_MODEL_CATALOG[params.id];
	return {
		id: params.id,
		name: params.name ?? catalog?.name ?? params.id,
		reasoning: params.reasoning ?? catalog?.reasoning ?? false,
		input: params.input ?? [...catalog?.input ?? ["text"]],
		cost: params.cost ?? MODELSTUDIO_DEFAULT_COST,
		contextWindow: params.contextWindow ?? catalog?.contextWindow ?? 262144,
		maxTokens: params.maxTokens ?? catalog?.maxTokens ?? 65536
	};
}
function buildModelStudioDefaultModelDefinition() {
	return buildModelStudioModelDefinition({ id: MODELSTUDIO_DEFAULT_MODEL_ID });
}
//#endregion
//#region extensions/moonshot/provider-catalog.ts
const MOONSHOT_BASE_URL = "https://api.moonshot.ai/v1";
const MOONSHOT_DEFAULT_MODEL_ID = "kimi-k2.5";
const MOONSHOT_DEFAULT_CONTEXT_WINDOW = 256e3;
const MOONSHOT_DEFAULT_MAX_TOKENS = 8192;
const MOONSHOT_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
function buildMoonshotProvider() {
	return {
		baseUrl: MOONSHOT_BASE_URL,
		api: "openai-completions",
		models: [{
			id: MOONSHOT_DEFAULT_MODEL_ID,
			name: "Kimi K2.5",
			reasoning: false,
			input: ["text", "image"],
			cost: MOONSHOT_DEFAULT_COST,
			contextWindow: MOONSHOT_DEFAULT_CONTEXT_WINDOW,
			maxTokens: MOONSHOT_DEFAULT_MAX_TOKENS
		}]
	};
}
//#endregion
//#region extensions/moonshot/onboard.ts
const MOONSHOT_CN_BASE_URL = "https://api.moonshot.cn/v1";
const MOONSHOT_DEFAULT_MODEL_REF = `moonshot/${MOONSHOT_DEFAULT_MODEL_ID}`;
function applyMoonshotProviderConfig(cfg) {
	return applyMoonshotProviderConfigWithBaseUrl(cfg, MOONSHOT_BASE_URL);
}
function applyMoonshotProviderConfigCn(cfg) {
	return applyMoonshotProviderConfigWithBaseUrl(cfg, MOONSHOT_CN_BASE_URL);
}
function applyMoonshotProviderConfigWithBaseUrl(cfg, baseUrl) {
	const models = { ...cfg.agents?.defaults?.models };
	models[MOONSHOT_DEFAULT_MODEL_REF] = {
		...models[MOONSHOT_DEFAULT_MODEL_REF],
		alias: models[MOONSHOT_DEFAULT_MODEL_REF]?.alias ?? "Kimi"
	};
	const defaultModel = buildMoonshotProvider().models[0];
	if (!defaultModel) return cfg;
	return applyProviderConfigWithDefaultModel(cfg, {
		agentModels: models,
		providerId: "moonshot",
		api: "openai-completions",
		baseUrl,
		defaultModel,
		defaultModelId: MOONSHOT_DEFAULT_MODEL_ID
	});
}
function applyMoonshotConfig(cfg) {
	return applyAgentDefaultModelPrimary(applyMoonshotProviderConfig(cfg), MOONSHOT_DEFAULT_MODEL_REF);
}
function applyMoonshotConfigCn(cfg) {
	return applyAgentDefaultModelPrimary(applyMoonshotProviderConfigCn(cfg), MOONSHOT_DEFAULT_MODEL_REF);
}
//#endregion
//#region extensions/xai/model-definitions.ts
const XAI_BASE_URL = "https://api.x.ai/v1";
const XAI_DEFAULT_MODEL_ID = "grok-4";
const XAI_DEFAULT_MODEL_REF = `xai/${XAI_DEFAULT_MODEL_ID}`;
const XAI_DEFAULT_CONTEXT_WINDOW = 131072;
const XAI_DEFAULT_MAX_TOKENS = 8192;
const XAI_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
function buildXaiModelDefinition() {
	return {
		id: XAI_DEFAULT_MODEL_ID,
		name: "Grok 4",
		reasoning: false,
		input: ["text"],
		cost: XAI_DEFAULT_COST,
		contextWindow: XAI_DEFAULT_CONTEXT_WINDOW,
		maxTokens: XAI_DEFAULT_MAX_TOKENS
	};
}
const CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF = `cloudflare-ai-gateway/claude-sonnet-4-5`;
const CLOUDFLARE_AI_GATEWAY_DEFAULT_CONTEXT_WINDOW = 2e5;
const CLOUDFLARE_AI_GATEWAY_DEFAULT_MAX_TOKENS = 64e3;
const CLOUDFLARE_AI_GATEWAY_DEFAULT_COST = {
	input: 3,
	output: 15,
	cacheRead: .3,
	cacheWrite: 3.75
};
function buildCloudflareAiGatewayModelDefinition(params) {
	return {
		id: params?.id?.trim() || "claude-sonnet-4-5",
		name: params?.name ?? "Claude Sonnet 4.5",
		reasoning: params?.reasoning ?? true,
		input: params?.input ?? ["text", "image"],
		cost: CLOUDFLARE_AI_GATEWAY_DEFAULT_COST,
		contextWindow: CLOUDFLARE_AI_GATEWAY_DEFAULT_CONTEXT_WINDOW,
		maxTokens: CLOUDFLARE_AI_GATEWAY_DEFAULT_MAX_TOKENS
	};
}
function resolveCloudflareAiGatewayBaseUrl(params) {
	const accountId = params.accountId.trim();
	const gatewayId = params.gatewayId.trim();
	if (!accountId || !gatewayId) return "";
	return `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/anthropic`;
}
//#endregion
//#region src/agents/ollama-defaults.ts
const OLLAMA_DEFAULT_BASE_URL = "http://127.0.0.1:11434";
//#endregion
//#region src/agents/ollama-models.ts
const OLLAMA_DEFAULT_CONTEXT_WINDOW = 128e3;
const OLLAMA_DEFAULT_MAX_TOKENS = 8192;
const OLLAMA_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const OLLAMA_SHOW_CONCURRENCY = 8;
/**
* Derive the Ollama native API base URL from a configured base URL.
*
* Users typically configure `baseUrl` with a `/v1` suffix (e.g.
* `http://192.168.20.14:11434/v1`) for the OpenAI-compatible endpoint.
* The native Ollama API lives at the root (e.g. `/api/tags`), so we
* strip the `/v1` suffix when present.
*/
function resolveOllamaApiBase(configuredBaseUrl) {
	if (!configuredBaseUrl) return OLLAMA_DEFAULT_BASE_URL;
	return configuredBaseUrl.replace(/\/+$/, "").replace(/\/v1$/i, "");
}
async function queryOllamaContextWindow(apiBase, modelName) {
	try {
		const response = await fetch(`${apiBase}/api/show`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: modelName }),
			signal: AbortSignal.timeout(3e3)
		});
		if (!response.ok) return;
		const data = await response.json();
		if (!data.model_info) return;
		for (const [key, value] of Object.entries(data.model_info)) if (key.endsWith(".context_length") && typeof value === "number" && Number.isFinite(value)) {
			const contextWindow = Math.floor(value);
			if (contextWindow > 0) return contextWindow;
		}
		return;
	} catch {
		return;
	}
}
async function enrichOllamaModelsWithContext(apiBase, models, opts) {
	const concurrency = Math.max(1, Math.floor(opts?.concurrency ?? OLLAMA_SHOW_CONCURRENCY));
	const enriched = [];
	for (let index = 0; index < models.length; index += concurrency) {
		const batch = models.slice(index, index + concurrency);
		const batchResults = await Promise.all(batch.map(async (model) => ({
			...model,
			contextWindow: await queryOllamaContextWindow(apiBase, model.name)
		})));
		enriched.push(...batchResults);
	}
	return enriched;
}
/** Heuristic: treat models with "r1", "reasoning", or "think" in the name as reasoning models. */
function isReasoningModelHeuristic(modelId) {
	return /r1|reasoning|think|reason/i.test(modelId);
}
/** Build a ModelDefinitionConfig for an Ollama model with default values. */
function buildOllamaModelDefinition(modelId, contextWindow) {
	return {
		id: modelId,
		name: modelId,
		reasoning: isReasoningModelHeuristic(modelId),
		input: ["text"],
		cost: OLLAMA_DEFAULT_COST,
		contextWindow: contextWindow ?? 128e3,
		maxTokens: OLLAMA_DEFAULT_MAX_TOKENS
	};
}
/** Fetch the model list from a running Ollama instance. */
async function fetchOllamaModels(baseUrl) {
	try {
		const apiBase = resolveOllamaApiBase(baseUrl);
		const response = await fetch(`${apiBase}/api/tags`, { signal: AbortSignal.timeout(5e3) });
		if (!response.ok) return {
			reachable: true,
			models: []
		};
		return {
			reachable: true,
			models: ((await response.json()).models ?? []).filter((m) => m.name)
		};
	} catch {
		return {
			reachable: false,
			models: []
		};
	}
}
//#endregion
//#region src/agents/huggingface-models.ts
const log$3 = createSubsystemLogger("huggingface-models");
/** Hugging Face Inference Providers (router) — OpenAI-compatible chat completions. */
const HUGGINGFACE_BASE_URL = "https://router.huggingface.co/v1";
/** Default cost when not in static catalog (HF pricing varies by provider). */
const HUGGINGFACE_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
/** Defaults for models discovered from GET /v1/models. */
const HUGGINGFACE_DEFAULT_CONTEXT_WINDOW = 131072;
const HUGGINGFACE_DEFAULT_MAX_TOKENS = 8192;
const HUGGINGFACE_MODEL_CATALOG = [
	{
		id: "deepseek-ai/DeepSeek-R1",
		name: "DeepSeek R1",
		reasoning: true,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: 3,
			output: 7,
			cacheRead: 3,
			cacheWrite: 3
		}
	},
	{
		id: "deepseek-ai/DeepSeek-V3.1",
		name: "DeepSeek V3.1",
		reasoning: false,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: .6,
			output: 1.25,
			cacheRead: .6,
			cacheWrite: .6
		}
	},
	{
		id: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
		name: "Llama 3.3 70B Instruct Turbo",
		reasoning: false,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: .88,
			output: .88,
			cacheRead: .88,
			cacheWrite: .88
		}
	},
	{
		id: "openai/gpt-oss-120b",
		name: "GPT-OSS 120B",
		reasoning: false,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0
		}
	}
];
function buildHuggingfaceModelDefinition(model) {
	return {
		id: model.id,
		name: model.name,
		reasoning: model.reasoning,
		input: model.input,
		cost: model.cost,
		contextWindow: model.contextWindow,
		maxTokens: model.maxTokens
	};
}
/**
* Infer reasoning and display name from Hub-style model id (e.g. "deepseek-ai/DeepSeek-R1").
*/
function inferredMetaFromModelId(id) {
	const base = id.split("/").pop() ?? id;
	const reasoning = isReasoningModelHeuristic(id);
	return {
		name: base.replace(/-/g, " ").replace(/\b(\w)/g, (c) => c.toUpperCase()),
		reasoning
	};
}
/** Prefer API-supplied display name, then owned_by/id, then inferred from id. */
function displayNameFromApiEntry(entry, inferredName) {
	const fromApi = typeof entry.name === "string" && entry.name.trim() || typeof entry.title === "string" && entry.title.trim() || typeof entry.display_name === "string" && entry.display_name.trim();
	if (fromApi) return fromApi;
	if (typeof entry.owned_by === "string" && entry.owned_by.trim()) {
		const base = entry.id.split("/").pop() ?? entry.id;
		return `${entry.owned_by.trim()}/${base}`;
	}
	return inferredName;
}
/**
* Discover chat-completion models from Hugging Face Inference Providers (GET /v1/models).
* Requires a valid HF token. Falls back to static catalog on failure or in test env.
*/
async function discoverHuggingfaceModels(apiKey) {
	if (process.env.VITEST === "true" || false) return HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
	const trimmedKey = apiKey?.trim();
	if (!trimmedKey) return HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
	try {
		const response = await fetch(`${HUGGINGFACE_BASE_URL}/models`, {
			signal: AbortSignal.timeout(1e4),
			headers: {
				Authorization: `Bearer ${trimmedKey}`,
				"Content-Type": "application/json"
			}
		});
		if (!response.ok) {
			log$3.warn(`GET /v1/models failed: HTTP ${response.status}, using static catalog`);
			return HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
		}
		const data = (await response.json())?.data;
		if (!Array.isArray(data) || data.length === 0) {
			log$3.warn("No models in response, using static catalog");
			return HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
		}
		const catalogById = new Map(HUGGINGFACE_MODEL_CATALOG.map((m) => [m.id, m]));
		const seen = /* @__PURE__ */ new Set();
		const models = [];
		for (const entry of data) {
			const id = typeof entry?.id === "string" ? entry.id.trim() : "";
			if (!id || seen.has(id)) continue;
			seen.add(id);
			const catalogEntry = catalogById.get(id);
			if (catalogEntry) models.push(buildHuggingfaceModelDefinition(catalogEntry));
			else {
				const inferred = inferredMetaFromModelId(id);
				const name = displayNameFromApiEntry(entry, inferred.name);
				const modalities = entry.architecture?.input_modalities;
				const input = Array.isArray(modalities) && modalities.includes("image") ? ["text", "image"] : ["text"];
				const contextLength = (Array.isArray(entry.providers) ? entry.providers : []).find((p) => typeof p?.context_length === "number" && p.context_length > 0)?.context_length ?? HUGGINGFACE_DEFAULT_CONTEXT_WINDOW;
				models.push({
					id,
					name,
					reasoning: inferred.reasoning,
					input,
					cost: HUGGINGFACE_DEFAULT_COST,
					contextWindow: contextLength,
					maxTokens: HUGGINGFACE_DEFAULT_MAX_TOKENS
				});
			}
		}
		return models.length > 0 ? models : HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
	} catch (error) {
		log$3.warn(`Discovery failed: ${String(error)}, using static catalog`);
		return HUGGINGFACE_MODEL_CATALOG.map(buildHuggingfaceModelDefinition);
	}
}
//#endregion
//#region src/agents/kilocode-models.ts
const log$2 = createSubsystemLogger("kilocode-models");
const KILOCODE_MODELS_URL = `${KILOCODE_BASE_URL}models`;
const DISCOVERY_TIMEOUT_MS = 5e3;
/**
* Convert per-token price (as returned by the gateway) to per-1M-token price
* (as stored in OpenClaw's ModelDefinitionConfig.cost).
*
* Gateway/OpenRouter prices are per-token strings like "0.000005".
* OpenClaw costs are per-1M-token numbers like 5.0.
*/
function toPricePerMillion(perToken) {
	if (!perToken) return 0;
	const num = Number(perToken);
	if (!Number.isFinite(num) || num < 0) return 0;
	return num * 1e6;
}
function parseModality(entry) {
	const modalities = entry.architecture?.input_modalities;
	if (!Array.isArray(modalities)) return ["text"];
	return modalities.some((m) => typeof m === "string" && m.toLowerCase() === "image") ? ["text", "image"] : ["text"];
}
function parseReasoning(entry) {
	const params = entry.supported_parameters;
	if (!Array.isArray(params)) return false;
	return params.includes("reasoning") || params.includes("include_reasoning");
}
function toModelDefinition(entry) {
	return {
		id: entry.id,
		name: entry.name || entry.id,
		reasoning: parseReasoning(entry),
		input: parseModality(entry),
		cost: {
			input: toPricePerMillion(entry.pricing.prompt),
			output: toPricePerMillion(entry.pricing.completion),
			cacheRead: toPricePerMillion(entry.pricing.input_cache_read),
			cacheWrite: toPricePerMillion(entry.pricing.input_cache_write)
		},
		contextWindow: entry.context_length || 1e6,
		maxTokens: entry.top_provider?.max_completion_tokens ?? 128e3
	};
}
function buildStaticCatalog() {
	return KILOCODE_MODEL_CATALOG.map((model) => ({
		id: model.id,
		name: model.name,
		reasoning: model.reasoning,
		input: model.input,
		cost: KILOCODE_DEFAULT_COST,
		contextWindow: model.contextWindow ?? 1e6,
		maxTokens: model.maxTokens ?? 128e3
	}));
}
/**
* Discover models from the Kilo Gateway API with fallback to static catalog.
* The /api/gateway/models endpoint is public and doesn't require authentication.
*/
async function discoverKilocodeModels() {
	if (process.env.VITEST) return buildStaticCatalog();
	try {
		const response = await fetch(KILOCODE_MODELS_URL, {
			headers: { Accept: "application/json" },
			signal: AbortSignal.timeout(DISCOVERY_TIMEOUT_MS)
		});
		if (!response.ok) {
			log$2.warn(`Failed to discover models: HTTP ${response.status}, using static catalog`);
			return buildStaticCatalog();
		}
		const data = await response.json();
		if (!Array.isArray(data.data) || data.data.length === 0) {
			log$2.warn("No models found from gateway API, using static catalog");
			return buildStaticCatalog();
		}
		const models = [];
		const discoveredIds = /* @__PURE__ */ new Set();
		for (const entry of data.data) {
			if (!entry || typeof entry !== "object") continue;
			const id = typeof entry.id === "string" ? entry.id.trim() : "";
			if (!id || discoveredIds.has(id)) continue;
			try {
				models.push(toModelDefinition(entry));
				discoveredIds.add(id);
			} catch (e) {
				log$2.warn(`Skipping malformed model entry "${id}": ${String(e)}`);
			}
		}
		const staticModels = buildStaticCatalog();
		for (const staticModel of staticModels) if (!discoveredIds.has(staticModel.id)) models.unshift(staticModel);
		return models.length > 0 ? models : buildStaticCatalog();
	} catch (error) {
		log$2.warn(`Discovery failed: ${String(error)}, using static catalog`);
		return buildStaticCatalog();
	}
}
//#endregion
//#region src/agents/synthetic-models.ts
const SYNTHETIC_BASE_URL = "https://api.synthetic.new/anthropic";
const SYNTHETIC_DEFAULT_MODEL_ID = "hf:MiniMaxAI/MiniMax-M2.5";
const SYNTHETIC_DEFAULT_MODEL_REF = `synthetic/${SYNTHETIC_DEFAULT_MODEL_ID}`;
const SYNTHETIC_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const SYNTHETIC_MODEL_CATALOG = [
	{
		id: SYNTHETIC_DEFAULT_MODEL_ID,
		name: "MiniMax M2.5",
		reasoning: false,
		input: ["text"],
		contextWindow: 192e3,
		maxTokens: 65536
	},
	{
		id: "hf:moonshotai/Kimi-K2-Thinking",
		name: "Kimi K2 Thinking",
		reasoning: true,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 8192
	},
	{
		id: "hf:zai-org/GLM-4.7",
		name: "GLM-4.7",
		reasoning: false,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 128e3
	},
	{
		id: "hf:deepseek-ai/DeepSeek-R1-0528",
		name: "DeepSeek R1 0528",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:deepseek-ai/DeepSeek-V3-0324",
		name: "DeepSeek V3 0324",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:deepseek-ai/DeepSeek-V3.1",
		name: "DeepSeek V3.1",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:deepseek-ai/DeepSeek-V3.1-Terminus",
		name: "DeepSeek V3.1 Terminus",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:deepseek-ai/DeepSeek-V3.2",
		name: "DeepSeek V3.2",
		reasoning: false,
		input: ["text"],
		contextWindow: 159e3,
		maxTokens: 8192
	},
	{
		id: "hf:meta-llama/Llama-3.3-70B-Instruct",
		name: "Llama 3.3 70B Instruct",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
		name: "Llama 4 Maverick 17B 128E Instruct FP8",
		reasoning: false,
		input: ["text"],
		contextWindow: 524e3,
		maxTokens: 8192
	},
	{
		id: "hf:moonshotai/Kimi-K2-Instruct-0905",
		name: "Kimi K2 Instruct 0905",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 8192
	},
	{
		id: "hf:moonshotai/Kimi-K2.5",
		name: "Kimi K2.5",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 8192
	},
	{
		id: "hf:openai/gpt-oss-120b",
		name: "GPT OSS 120B",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:Qwen/Qwen3-235B-A22B-Instruct-2507",
		name: "Qwen3 235B A22B Instruct 2507",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 8192
	},
	{
		id: "hf:Qwen/Qwen3-Coder-480B-A35B-Instruct",
		name: "Qwen3 Coder 480B A35B Instruct",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 8192
	},
	{
		id: "hf:Qwen/Qwen3-VL-235B-A22B-Instruct",
		name: "Qwen3 VL 235B A22B Instruct",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 25e4,
		maxTokens: 8192
	},
	{
		id: "hf:zai-org/GLM-4.5",
		name: "GLM-4.5",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 128e3
	},
	{
		id: "hf:zai-org/GLM-4.6",
		name: "GLM-4.6",
		reasoning: false,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 128e3
	},
	{
		id: "hf:zai-org/GLM-5",
		name: "GLM-5",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 128e3
	},
	{
		id: "hf:deepseek-ai/DeepSeek-V3",
		name: "DeepSeek V3",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 8192
	},
	{
		id: "hf:Qwen/Qwen3-235B-A22B-Thinking-2507",
		name: "Qwen3 235B A22B Thinking 2507",
		reasoning: true,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 8192
	}
];
function buildSyntheticModelDefinition(entry) {
	return {
		id: entry.id,
		name: entry.name,
		reasoning: entry.reasoning,
		input: [...entry.input],
		cost: SYNTHETIC_DEFAULT_COST,
		contextWindow: entry.contextWindow,
		maxTokens: entry.maxTokens
	};
}
//#endregion
//#region src/agents/together-models.ts
const TOGETHER_BASE_URL = "https://api.together.xyz/v1";
const TOGETHER_MODEL_CATALOG = [
	{
		id: "zai-org/GLM-4.7",
		name: "GLM 4.7 Fp8",
		reasoning: false,
		input: ["text"],
		contextWindow: 202752,
		maxTokens: 8192,
		cost: {
			input: .45,
			output: 2,
			cacheRead: .45,
			cacheWrite: 2
		}
	},
	{
		id: "moonshotai/Kimi-K2.5",
		name: "Kimi K2.5",
		reasoning: true,
		input: ["text", "image"],
		cost: {
			input: .5,
			output: 2.8,
			cacheRead: .5,
			cacheWrite: 2.8
		},
		contextWindow: 262144,
		maxTokens: 32768
	},
	{
		id: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
		name: "Llama 3.3 70B Instruct Turbo",
		reasoning: false,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: .88,
			output: .88,
			cacheRead: .88,
			cacheWrite: .88
		}
	},
	{
		id: "meta-llama/Llama-4-Scout-17B-16E-Instruct",
		name: "Llama 4 Scout 17B 16E Instruct",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 1e7,
		maxTokens: 32768,
		cost: {
			input: .18,
			output: .59,
			cacheRead: .18,
			cacheWrite: .18
		}
	},
	{
		id: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
		name: "Llama 4 Maverick 17B 128E Instruct FP8",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 2e7,
		maxTokens: 32768,
		cost: {
			input: .27,
			output: .85,
			cacheRead: .27,
			cacheWrite: .27
		}
	},
	{
		id: "deepseek-ai/DeepSeek-V3.1",
		name: "DeepSeek V3.1",
		reasoning: false,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: .6,
			output: 1.25,
			cacheRead: .6,
			cacheWrite: .6
		}
	},
	{
		id: "deepseek-ai/DeepSeek-R1",
		name: "DeepSeek R1",
		reasoning: true,
		input: ["text"],
		contextWindow: 131072,
		maxTokens: 8192,
		cost: {
			input: 3,
			output: 7,
			cacheRead: 3,
			cacheWrite: 3
		}
	},
	{
		id: "moonshotai/Kimi-K2-Instruct-0905",
		name: "Kimi K2-Instruct 0905",
		reasoning: false,
		input: ["text"],
		contextWindow: 262144,
		maxTokens: 8192,
		cost: {
			input: 1,
			output: 3,
			cacheRead: 1,
			cacheWrite: 3
		}
	}
];
function buildTogetherModelDefinition(model) {
	return {
		id: model.id,
		name: model.name,
		api: "openai-completions",
		reasoning: model.reasoning,
		input: model.input,
		cost: model.cost,
		contextWindow: model.contextWindow,
		maxTokens: model.maxTokens
	};
}
//#endregion
//#region src/agents/venice-models.ts
const log$1 = createSubsystemLogger("venice-models");
const VENICE_BASE_URL = "https://api.venice.ai/api/v1";
const VENICE_DEFAULT_MODEL_REF = `venice/kimi-k2-5`;
const VENICE_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const VENICE_DEFAULT_CONTEXT_WINDOW = 128e3;
const VENICE_DEFAULT_MAX_TOKENS = 4096;
const VENICE_DISCOVERY_HARD_MAX_TOKENS = 131072;
const VENICE_DISCOVERY_TIMEOUT_MS = 1e4;
const VENICE_DISCOVERY_RETRYABLE_HTTP_STATUS = new Set([
	408,
	425,
	429,
	500,
	502,
	503,
	504
]);
const VENICE_DISCOVERY_RETRYABLE_NETWORK_CODES = new Set([
	"ECONNABORTED",
	"ECONNREFUSED",
	"ECONNRESET",
	"EAI_AGAIN",
	"ENETDOWN",
	"ENETUNREACH",
	"ENOTFOUND",
	"ETIMEDOUT",
	"UND_ERR_BODY_TIMEOUT",
	"UND_ERR_CONNECT_TIMEOUT",
	"UND_ERR_CONNECT_ERROR",
	"UND_ERR_HEADERS_TIMEOUT",
	"UND_ERR_SOCKET"
]);
/**
* Complete catalog of Venice AI models.
*
* Venice provides two privacy modes:
* - "private": Fully private inference, no logging, ephemeral
* - "anonymized": Proxied through Venice with metadata stripped (for proprietary models)
*
* Note: The `privacy` field is included for documentation purposes but is not
* propagated to ModelDefinitionConfig as it's not part of the core model schema.
* Privacy mode is determined by the model itself, not configurable at runtime.
*
* This catalog serves as a fallback when the Venice API is unreachable.
*/
const VENICE_MODEL_CATALOG = [
	{
		id: "llama-3.3-70b",
		name: "Llama 3.3 70B",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 4096,
		privacy: "private"
	},
	{
		id: "llama-3.2-3b",
		name: "Llama 3.2 3B",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 4096,
		privacy: "private"
	},
	{
		id: "hermes-3-llama-3.1-405b",
		name: "Hermes 3 Llama 3.1 405B",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 16384,
		supportsTools: false,
		privacy: "private"
	},
	{
		id: "qwen3-235b-a22b-thinking-2507",
		name: "Qwen3 235B Thinking",
		reasoning: true,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "qwen3-235b-a22b-instruct-2507",
		name: "Qwen3 235B Instruct",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "qwen3-coder-480b-a35b-instruct",
		name: "Qwen3 Coder 480B",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "private"
	},
	{
		id: "qwen3-coder-480b-a35b-instruct-turbo",
		name: "Qwen3 Coder 480B Turbo",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "private"
	},
	{
		id: "qwen3-5-35b-a3b",
		name: "Qwen3.5 35B A3B",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "private"
	},
	{
		id: "qwen3-next-80b",
		name: "Qwen3 Next 80B",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "qwen3-vl-235b-a22b",
		name: "Qwen3 VL 235B (Vision)",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "qwen3-4b",
		name: "Venice Small (Qwen3 4B)",
		reasoning: true,
		input: ["text"],
		contextWindow: 32e3,
		maxTokens: 4096,
		privacy: "private"
	},
	{
		id: "deepseek-v3.2",
		name: "DeepSeek V3.2",
		reasoning: true,
		input: ["text"],
		contextWindow: 16e4,
		maxTokens: 32768,
		supportsTools: false,
		privacy: "private"
	},
	{
		id: "venice-uncensored",
		name: "Venice Uncensored (Dolphin-Mistral)",
		reasoning: false,
		input: ["text"],
		contextWindow: 32e3,
		maxTokens: 4096,
		supportsTools: false,
		privacy: "private"
	},
	{
		id: "mistral-31-24b",
		name: "Venice Medium (Mistral)",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 128e3,
		maxTokens: 4096,
		privacy: "private"
	},
	{
		id: "google-gemma-3-27b-it",
		name: "Google Gemma 3 27B Instruct",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 198e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "openai-gpt-oss-120b",
		name: "OpenAI GPT OSS 120B",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "nvidia-nemotron-3-nano-30b-a3b",
		name: "NVIDIA Nemotron 3 Nano 30B",
		reasoning: false,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "olafangensan-glm-4.7-flash-heretic",
		name: "GLM 4.7 Flash Heretic",
		reasoning: true,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 24e3,
		privacy: "private"
	},
	{
		id: "zai-org-glm-4.6",
		name: "GLM 4.6",
		reasoning: false,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "zai-org-glm-4.7",
		name: "GLM 4.7",
		reasoning: true,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "zai-org-glm-4.7-flash",
		name: "GLM 4.7 Flash",
		reasoning: true,
		input: ["text"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "private"
	},
	{
		id: "zai-org-glm-5",
		name: "GLM 5",
		reasoning: true,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 32e3,
		privacy: "private"
	},
	{
		id: "kimi-k2-5",
		name: "Kimi K2.5",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "private"
	},
	{
		id: "kimi-k2-thinking",
		name: "Kimi K2 Thinking",
		reasoning: true,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "private"
	},
	{
		id: "minimax-m21",
		name: "MiniMax M2.1",
		reasoning: true,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 32768,
		privacy: "private"
	},
	{
		id: "minimax-m25",
		name: "MiniMax M2.5",
		reasoning: true,
		input: ["text"],
		contextWindow: 198e3,
		maxTokens: 32768,
		privacy: "private"
	},
	{
		id: "claude-opus-4-5",
		name: "Claude Opus 4.5 (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 198e3,
		maxTokens: 32768,
		privacy: "anonymized"
	},
	{
		id: "claude-opus-4-6",
		name: "Claude Opus 4.6 (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 128e3,
		privacy: "anonymized"
	},
	{
		id: "claude-sonnet-4-5",
		name: "Claude Sonnet 4.5 (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 198e3,
		maxTokens: 64e3,
		privacy: "anonymized"
	},
	{
		id: "claude-sonnet-4-6",
		name: "Claude Sonnet 4.6 (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 64e3,
		privacy: "anonymized"
	},
	{
		id: "openai-gpt-52",
		name: "GPT-5.2 (via Venice)",
		reasoning: true,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "anonymized"
	},
	{
		id: "openai-gpt-52-codex",
		name: "GPT-5.2 Codex (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "anonymized"
	},
	{
		id: "openai-gpt-53-codex",
		name: "GPT-5.3 Codex (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 4e5,
		maxTokens: 128e3,
		privacy: "anonymized"
	},
	{
		id: "openai-gpt-54",
		name: "GPT-5.4 (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 131072,
		privacy: "anonymized"
	},
	{
		id: "openai-gpt-4o-2024-11-20",
		name: "GPT-4o (via Venice)",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "anonymized"
	},
	{
		id: "openai-gpt-4o-mini-2024-07-18",
		name: "GPT-4o Mini (via Venice)",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 128e3,
		maxTokens: 16384,
		privacy: "anonymized"
	},
	{
		id: "gemini-3-pro-preview",
		name: "Gemini 3 Pro (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 198e3,
		maxTokens: 32768,
		privacy: "anonymized"
	},
	{
		id: "gemini-3-1-pro-preview",
		name: "Gemini 3.1 Pro (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 32768,
		privacy: "anonymized"
	},
	{
		id: "gemini-3-flash-preview",
		name: "Gemini 3 Flash (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 65536,
		privacy: "anonymized"
	},
	{
		id: "grok-41-fast",
		name: "Grok 4.1 Fast (via Venice)",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 3e4,
		privacy: "anonymized"
	},
	{
		id: "grok-code-fast-1",
		name: "Grok Code Fast 1 (via Venice)",
		reasoning: true,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 1e4,
		privacy: "anonymized"
	}
];
/**
* Build a ModelDefinitionConfig from a Venice catalog entry.
*
* Note: The `privacy` field from the catalog is not included in the output
* as ModelDefinitionConfig doesn't support custom metadata fields. Privacy
* mode is inherent to each model and documented in the catalog/docs.
*/
function buildVeniceModelDefinition(entry) {
	return {
		id: entry.id,
		name: entry.name,
		reasoning: entry.reasoning,
		input: [...entry.input],
		cost: VENICE_DEFAULT_COST,
		contextWindow: entry.contextWindow,
		maxTokens: entry.maxTokens,
		compat: {
			supportsUsageInStreaming: false,
			..."supportsTools" in entry && !entry.supportsTools ? { supportsTools: false } : {}
		}
	};
}
var VeniceDiscoveryHttpError = class extends Error {
	constructor(status) {
		super(`HTTP ${status}`);
		this.name = "VeniceDiscoveryHttpError";
		this.status = status;
	}
};
function staticVeniceModelDefinitions() {
	return VENICE_MODEL_CATALOG.map(buildVeniceModelDefinition);
}
function hasRetryableNetworkCode(err) {
	const queue = [err];
	const seen = /* @__PURE__ */ new Set();
	while (queue.length > 0) {
		const current = queue.shift();
		if (!current || typeof current !== "object" || seen.has(current)) continue;
		seen.add(current);
		const candidate = current;
		const code = typeof candidate.code === "string" ? candidate.code : typeof candidate.errno === "string" ? candidate.errno : void 0;
		if (code && VENICE_DISCOVERY_RETRYABLE_NETWORK_CODES.has(code)) return true;
		if (candidate.cause) queue.push(candidate.cause);
		if (Array.isArray(candidate.errors)) queue.push(...candidate.errors);
	}
	return false;
}
function isRetryableVeniceDiscoveryError(err) {
	if (err instanceof VeniceDiscoveryHttpError) return true;
	if (err instanceof Error && err.name === "AbortError") return true;
	if (err instanceof TypeError && err.message.toLowerCase() === "fetch failed") return true;
	return hasRetryableNetworkCode(err);
}
function normalizePositiveInt(value) {
	if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return;
	return Math.floor(value);
}
function resolveApiMaxCompletionTokens(params) {
	const raw = normalizePositiveInt(params.apiModel.model_spec?.maxCompletionTokens);
	if (!raw) return;
	const contextWindow = normalizePositiveInt(params.apiModel.model_spec?.availableContextTokens);
	const knownMaxTokens = typeof params.knownMaxTokens === "number" && Number.isFinite(params.knownMaxTokens) ? Math.floor(params.knownMaxTokens) : void 0;
	const hardCap = knownMaxTokens ?? VENICE_DISCOVERY_HARD_MAX_TOKENS;
	const fallbackContextWindow = knownMaxTokens ?? VENICE_DEFAULT_CONTEXT_WINDOW;
	return Math.min(raw, contextWindow ?? fallbackContextWindow, hardCap);
}
function resolveApiSupportsTools(apiModel) {
	const supportsFunctionCalling = apiModel.model_spec?.capabilities?.supportsFunctionCalling;
	return typeof supportsFunctionCalling === "boolean" ? supportsFunctionCalling : void 0;
}
/**
* Discover models from Venice API with fallback to static catalog.
* The /models endpoint is public and doesn't require authentication.
*/
async function discoverVeniceModels() {
	if (process.env.VITEST) return staticVeniceModelDefinitions();
	try {
		const response = await retryAsync(async () => {
			const currentResponse = await fetch(`${VENICE_BASE_URL}/models`, {
				signal: AbortSignal.timeout(VENICE_DISCOVERY_TIMEOUT_MS),
				headers: { Accept: "application/json" }
			});
			if (!currentResponse.ok && VENICE_DISCOVERY_RETRYABLE_HTTP_STATUS.has(currentResponse.status)) throw new VeniceDiscoveryHttpError(currentResponse.status);
			return currentResponse;
		}, {
			attempts: 3,
			minDelayMs: 300,
			maxDelayMs: 2e3,
			jitter: .2,
			label: "venice-model-discovery",
			shouldRetry: isRetryableVeniceDiscoveryError
		});
		if (!response.ok) {
			log$1.warn(`Failed to discover models: HTTP ${response.status}, using static catalog`);
			return staticVeniceModelDefinitions();
		}
		const data = await response.json();
		if (!Array.isArray(data.data) || data.data.length === 0) {
			log$1.warn("No models found from API, using static catalog");
			return staticVeniceModelDefinitions();
		}
		const catalogById = new Map(VENICE_MODEL_CATALOG.map((m) => [m.id, m]));
		const models = [];
		for (const apiModel of data.data) {
			const catalogEntry = catalogById.get(apiModel.id);
			const apiMaxTokens = resolveApiMaxCompletionTokens({
				apiModel,
				knownMaxTokens: catalogEntry?.maxTokens
			});
			const apiSupportsTools = resolveApiSupportsTools(apiModel);
			if (catalogEntry) {
				const definition = buildVeniceModelDefinition(catalogEntry);
				if (apiMaxTokens !== void 0) definition.maxTokens = apiMaxTokens;
				if (apiSupportsTools === false) definition.compat = {
					...definition.compat,
					supportsTools: false
				};
				models.push(definition);
			} else {
				const apiSpec = apiModel.model_spec;
				const isReasoning = apiSpec?.capabilities?.supportsReasoning || apiModel.id.toLowerCase().includes("thinking") || apiModel.id.toLowerCase().includes("reason") || apiModel.id.toLowerCase().includes("r1");
				const hasVision = apiSpec?.capabilities?.supportsVision === true;
				models.push({
					id: apiModel.id,
					name: apiSpec?.name || apiModel.id,
					reasoning: isReasoning,
					input: hasVision ? ["text", "image"] : ["text"],
					cost: VENICE_DEFAULT_COST,
					contextWindow: normalizePositiveInt(apiSpec?.availableContextTokens) ?? VENICE_DEFAULT_CONTEXT_WINDOW,
					maxTokens: apiMaxTokens ?? VENICE_DEFAULT_MAX_TOKENS,
					compat: {
						supportsUsageInStreaming: false,
						...apiSupportsTools === false ? { supportsTools: false } : {}
					}
				});
			}
		}
		return models.length > 0 ? models : staticVeniceModelDefinitions();
	} catch (error) {
		if (error instanceof VeniceDiscoveryHttpError) {
			log$1.warn(`Failed to discover models: HTTP ${error.status}, using static catalog`);
			return staticVeniceModelDefinitions();
		}
		log$1.warn(`Discovery failed: ${String(error)}, using static catalog`);
		return staticVeniceModelDefinitions();
	}
}
//#endregion
//#region src/agents/volc-models.shared.ts
const VOLC_MODEL_KIMI_K2_5 = {
	id: "kimi-k2-5-260127",
	name: "Kimi K2.5",
	reasoning: false,
	input: ["text", "image"],
	contextWindow: 256e3,
	maxTokens: 4096
};
const VOLC_MODEL_GLM_4_7 = {
	id: "glm-4-7-251222",
	name: "GLM 4.7",
	reasoning: false,
	input: ["text", "image"],
	contextWindow: 2e5,
	maxTokens: 4096
};
const VOLC_SHARED_CODING_MODEL_CATALOG = [
	{
		id: "ark-code-latest",
		name: "Ark Coding Plan",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	{
		id: "doubao-seed-code",
		name: "Doubao Seed Code",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	{
		id: "glm-4.7",
		name: "GLM 4.7 Coding",
		reasoning: false,
		input: ["text"],
		contextWindow: 2e5,
		maxTokens: 4096
	},
	{
		id: "kimi-k2-thinking",
		name: "Kimi K2 Thinking",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	{
		id: "kimi-k2.5",
		name: "Kimi K2.5 Coding",
		reasoning: false,
		input: ["text"],
		contextWindow: 256e3,
		maxTokens: 4096
	}
];
function buildVolcModelDefinition(entry, cost) {
	return {
		id: entry.id,
		name: entry.name,
		reasoning: entry.reasoning,
		input: [...entry.input],
		cost,
		contextWindow: entry.contextWindow,
		maxTokens: entry.maxTokens
	};
}
//#endregion
//#region src/agents/byteplus-models.ts
const BYTEPLUS_BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/v3";
const BYTEPLUS_CODING_BASE_URL = "https://ark.ap-southeast.bytepluses.com/api/coding/v3";
const BYTEPLUS_DEFAULT_COST = {
	input: 1e-4,
	output: 2e-4,
	cacheRead: 0,
	cacheWrite: 0
};
/**
* Complete catalog of BytePlus ARK models.
*
* BytePlus ARK provides access to various models
* through the ARK API. Authentication requires a BYTEPLUS_API_KEY.
*/
const BYTEPLUS_MODEL_CATALOG = [
	{
		id: "seed-1-8-251228",
		name: "Seed 1.8",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	VOLC_MODEL_KIMI_K2_5,
	VOLC_MODEL_GLM_4_7
];
function buildBytePlusModelDefinition(entry) {
	return buildVolcModelDefinition(entry, BYTEPLUS_DEFAULT_COST);
}
const BYTEPLUS_CODING_MODEL_CATALOG = VOLC_SHARED_CODING_MODEL_CATALOG;
//#endregion
//#region src/agents/doubao-models.ts
const DOUBAO_BASE_URL = "https://ark.cn-beijing.volces.com/api/v3";
const DOUBAO_CODING_BASE_URL = "https://ark.cn-beijing.volces.com/api/coding/v3";
const DOUBAO_DEFAULT_COST = {
	input: 1e-4,
	output: 2e-4,
	cacheRead: 0,
	cacheWrite: 0
};
/**
* Complete catalog of Volcano Engine models.
*
* Volcano Engine provides access to models
* through the API. Authentication requires a Volcano Engine API Key.
*/
const DOUBAO_MODEL_CATALOG = [
	{
		id: "doubao-seed-code-preview-251028",
		name: "doubao-seed-code-preview-251028",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	{
		id: "doubao-seed-1-8-251228",
		name: "Doubao Seed 1.8",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 256e3,
		maxTokens: 4096
	},
	VOLC_MODEL_KIMI_K2_5,
	VOLC_MODEL_GLM_4_7,
	{
		id: "deepseek-v3-2-251201",
		name: "DeepSeek V3.2",
		reasoning: false,
		input: ["text", "image"],
		contextWindow: 128e3,
		maxTokens: 4096
	}
];
function buildDoubaoModelDefinition(entry) {
	return buildVolcModelDefinition(entry, DOUBAO_DEFAULT_COST);
}
const DOUBAO_CODING_MODEL_CATALOG = [...VOLC_SHARED_CODING_MODEL_CATALOG, {
	id: "doubao-seed-code-preview-251028",
	name: "Doubao Seed Code Preview",
	reasoning: false,
	input: ["text"],
	contextWindow: 256e3,
	maxTokens: 4096
}];
//#endregion
//#region src/agents/vllm-defaults.ts
const VLLM_DEFAULT_BASE_URL = "http://127.0.0.1:8000/v1";
const VLLM_PROVIDER_LABEL = "vLLM";
const VLLM_DEFAULT_API_KEY_ENV_VAR = "VLLM_API_KEY";
const VLLM_MODEL_PLACEHOLDER = "meta-llama/Meta-Llama-3-8B-Instruct";
//#endregion
//#region src/agents/sglang-defaults.ts
const SGLANG_DEFAULT_BASE_URL = "http://127.0.0.1:30000/v1";
const SGLANG_PROVIDER_LABEL = "SGLang";
const SGLANG_DEFAULT_API_KEY_ENV_VAR = "SGLANG_API_KEY";
const SGLANG_MODEL_PLACEHOLDER = "Qwen/Qwen3-8B";
//#endregion
//#region src/agents/vercel-ai-gateway.ts
const VERCEL_AI_GATEWAY_PROVIDER_ID = "vercel-ai-gateway";
const VERCEL_AI_GATEWAY_BASE_URL = "https://ai-gateway.vercel.sh";
`${VERCEL_AI_GATEWAY_PROVIDER_ID}`;
const VERCEL_AI_GATEWAY_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const log = createSubsystemLogger("agents/vercel-ai-gateway");
const STATIC_VERCEL_AI_GATEWAY_MODEL_CATALOG = [
	{
		id: "anthropic/claude-opus-4.6",
		name: "Claude Opus 4.6",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 1e6,
		maxTokens: 128e3,
		cost: {
			input: 5,
			output: 25,
			cacheRead: .5,
			cacheWrite: 6.25
		}
	},
	{
		id: "openai/gpt-5.4",
		name: "GPT 5.4",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 2e5,
		maxTokens: 128e3,
		cost: {
			input: 2.5,
			output: 15,
			cacheRead: .25
		}
	},
	{
		id: "openai/gpt-5.4-pro",
		name: "GPT 5.4 Pro",
		reasoning: true,
		input: ["text", "image"],
		contextWindow: 2e5,
		maxTokens: 128e3,
		cost: {
			input: 30,
			output: 180,
			cacheRead: 0
		}
	}
];
function toPerMillionCost(value) {
	const numeric = typeof value === "number" ? value : typeof value === "string" ? Number.parseFloat(value) : NaN;
	if (!Number.isFinite(numeric) || numeric < 0) return 0;
	return numeric * 1e6;
}
function normalizeCost(pricing) {
	return {
		input: toPerMillionCost(pricing?.input),
		output: toPerMillionCost(pricing?.output),
		cacheRead: toPerMillionCost(pricing?.input_cache_read),
		cacheWrite: toPerMillionCost(pricing?.input_cache_write)
	};
}
function buildStaticModelDefinition(model) {
	return {
		id: model.id,
		name: model.name,
		reasoning: model.reasoning,
		input: model.input,
		contextWindow: model.contextWindow,
		maxTokens: model.maxTokens,
		cost: {
			...VERCEL_AI_GATEWAY_DEFAULT_COST,
			...model.cost
		}
	};
}
function getStaticFallbackModel(id) {
	const fallback = STATIC_VERCEL_AI_GATEWAY_MODEL_CATALOG.find((model) => model.id === id);
	return fallback ? buildStaticModelDefinition(fallback) : void 0;
}
function getStaticVercelAiGatewayModelCatalog() {
	return STATIC_VERCEL_AI_GATEWAY_MODEL_CATALOG.map(buildStaticModelDefinition);
}
function buildDiscoveredModelDefinition(model) {
	const id = typeof model.id === "string" ? model.id.trim() : "";
	if (!id) return null;
	const fallback = getStaticFallbackModel(id);
	const contextWindow = typeof model.context_window === "number" && Number.isFinite(model.context_window) ? model.context_window : fallback?.contextWindow ?? 2e5;
	const maxTokens = typeof model.max_tokens === "number" && Number.isFinite(model.max_tokens) ? model.max_tokens : fallback?.maxTokens ?? 128e3;
	const normalizedCost = normalizeCost(model.pricing);
	return {
		id,
		name: (typeof model.name === "string" ? model.name.trim() : "") || fallback?.name || id,
		reasoning: Array.isArray(model.tags) && model.tags.includes("reasoning") ? true : fallback?.reasoning ?? false,
		input: Array.isArray(model.tags) ? model.tags.includes("vision") ? ["text", "image"] : ["text"] : fallback?.input ?? ["text"],
		contextWindow,
		maxTokens,
		cost: normalizedCost.input > 0 || normalizedCost.output > 0 || normalizedCost.cacheRead > 0 || normalizedCost.cacheWrite > 0 ? normalizedCost : fallback?.cost ?? VERCEL_AI_GATEWAY_DEFAULT_COST
	};
}
async function discoverVercelAiGatewayModels() {
	if (process.env.VITEST || false) return getStaticVercelAiGatewayModelCatalog();
	try {
		const response = await fetch(`${VERCEL_AI_GATEWAY_BASE_URL}/v1/models`, { signal: AbortSignal.timeout(5e3) });
		if (!response.ok) {
			log.warn(`Failed to discover Vercel AI Gateway models: HTTP ${response.status}`);
			return getStaticVercelAiGatewayModelCatalog();
		}
		const discovered = ((await response.json()).data ?? []).map(buildDiscoveredModelDefinition).filter((entry) => entry !== null);
		return discovered.length > 0 ? discovered : getStaticVercelAiGatewayModelCatalog();
	} catch (error) {
		log.warn(`Failed to discover Vercel AI Gateway models: ${String(error)}`);
		return getStaticVercelAiGatewayModelCatalog();
	}
}
//#endregion
//#region src/plugin-sdk/provider-models.ts
function buildKilocodeModelDefinition() {
	return {
		id: KILOCODE_DEFAULT_MODEL_ID,
		name: KILOCODE_DEFAULT_MODEL_NAME,
		reasoning: true,
		input: ["text", "image"],
		cost: KILOCODE_DEFAULT_COST,
		contextWindow: KILOCODE_DEFAULT_CONTEXT_WINDOW,
		maxTokens: KILOCODE_DEFAULT_MAX_TOKENS
	};
}
//#endregion
export { XAI_DEFAULT_MODEL_REF as $, SYNTHETIC_BASE_URL as A, applyGoogleGeminiModelDefault as At, OLLAMA_DEFAULT_COST as B, KILOCODE_DEFAULT_MODEL_NAME as Bt, VENICE_DEFAULT_MODEL_REF as C, MINIMAX_LM_STUDIO_COST as Ct, TOGETHER_BASE_URL as D, OPENAI_DEFAULT_MODEL as Dt, discoverVeniceModels as E, GOOGLE_GEMINI_DEFAULT_MODEL as Et, HUGGINGFACE_BASE_URL as F, KILOCODE_BASE_URL as Ft, isReasoningModelHeuristic as G, buildOllamaModelDefinition as H, KILOCODE_MODEL_CATALOG as Ht, HUGGINGFACE_MODEL_CATALOG as I, KILOCODE_DEFAULT_CONTEXT_WINDOW as It, CLOUDFLARE_AI_GATEWAY_DEFAULT_MODEL_REF as J, resolveOllamaApiBase as K, buildHuggingfaceModelDefinition as L, KILOCODE_DEFAULT_COST as Lt, SYNTHETIC_MODEL_CATALOG as M, applyPrimaryModel as Mt, buildSyntheticModelDefinition as N, cloneFirstTemplateModel as Nt, TOGETHER_MODEL_CATALOG as O, OPENCODE_GO_DEFAULT_MODEL_REF as Ot, discoverKilocodeModels as P, normalizeModelCompat as Pt, XAI_DEFAULT_MODEL_ID as Q, discoverHuggingfaceModels as R, KILOCODE_DEFAULT_MAX_TOKENS as Rt, VENICE_BASE_URL as S, MINIMAX_HOSTED_MODEL_REF as St, buildVeniceModelDefinition as T, OPENCODE_ZEN_DEFAULT_MODEL_REF as Tt, enrichOllamaModelsWithContext as U, resolveRetryConfig as Ut, OLLAMA_DEFAULT_MAX_TOKENS as V, KILOCODE_DEFAULT_MODEL_REF as Vt, fetchOllamaModels as W, retryAsync as Wt, resolveCloudflareAiGatewayBaseUrl as X, buildCloudflareAiGatewayModelDefinition as Y, XAI_BASE_URL as Z, BYTEPLUS_BASE_URL as _, DEFAULT_MINIMAX_BASE_URL as _t, SGLANG_DEFAULT_BASE_URL as a, MOONSHOT_BASE_URL as at, BYTEPLUS_MODEL_CATALOG as b, MINIMAX_HOSTED_COST as bt, VLLM_DEFAULT_API_KEY_ENV_VAR as c, MODELSTUDIO_DEFAULT_MODEL_ID as ct, VLLM_PROVIDER_LABEL as d, buildModelStudioDefaultModelDefinition as dt, buildXaiModelDefinition as et, DOUBAO_BASE_URL as f, buildModelStudioModelDefinition as ft, buildDoubaoModelDefinition as g, buildMistralModelDefinition as gt, DOUBAO_MODEL_CATALOG as h, MISTRAL_DEFAULT_MODEL_REF as ht, SGLANG_DEFAULT_API_KEY_ENV_VAR as i, applyMoonshotConfigCn as it, SYNTHETIC_DEFAULT_MODEL_REF as j, applyOpenAIConfig as jt, buildTogetherModelDefinition as k, OPENCODE_ZEN_DEFAULT_MODEL$1 as kt, VLLM_DEFAULT_BASE_URL as l, MODELSTUDIO_DEFAULT_MODEL_REF as lt, DOUBAO_CODING_MODEL_CATALOG as m, MISTRAL_DEFAULT_MODEL_ID as mt, VERCEL_AI_GATEWAY_BASE_URL as n, MOONSHOT_DEFAULT_MODEL_REF as nt, SGLANG_MODEL_PLACEHOLDER as o, buildMoonshotProvider as ot, DOUBAO_CODING_BASE_URL as p, MISTRAL_BASE_URL as pt, OLLAMA_DEFAULT_BASE_URL as q, discoverVercelAiGatewayModels as r, applyMoonshotConfig as rt, SGLANG_PROVIDER_LABEL as s, MODELSTUDIO_CN_BASE_URL as st, buildKilocodeModelDefinition as t, MOONSHOT_CN_BASE_URL as tt, VLLM_MODEL_PLACEHOLDER as u, MODELSTUDIO_GLOBAL_BASE_URL as ut, BYTEPLUS_CODING_BASE_URL as v, MINIMAX_API_BASE_URL as vt, VENICE_MODEL_CATALOG as w, buildMinimaxApiModelDefinition as wt, buildBytePlusModelDefinition as x, MINIMAX_HOSTED_MODEL_ID as xt, BYTEPLUS_CODING_MODEL_CATALOG as y, MINIMAX_CN_API_BASE_URL as yt, OLLAMA_DEFAULT_CONTEXT_WINDOW as z, KILOCODE_DEFAULT_MODEL_ID as zt };
