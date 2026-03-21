import { _ as resolveStateDir } from "./paths-1qR_mW4i.js";
import { t as createSubsystemLogger } from "./subsystem-MGyxt_Bl.js";
import { w as normalizeProviderId } from "./model-selection-DJOYg7Dx.js";
import { a as logWarn } from "./logger-iZtdpoh6.js";
import { o as resolveRuntimeServiceVersion } from "./version-BMIQmWNJ.js";
import { n as hasEnvHttpProxyConfigured } from "./proxy-env-CpbYErbv.js";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { EnvHttpProxyAgent, ProxyAgent, fetch } from "undici";
import { streamSimple } from "@mariozechner/pi-ai";
//#region src/infra/net/proxy-fetch.ts
const PROXY_FETCH_PROXY_URL = Symbol.for("openclaw.proxyFetch.proxyUrl");
/**
* Create a fetch function that routes requests through the given HTTP proxy.
* Uses undici's ProxyAgent under the hood.
*/
function makeProxyFetch(proxyUrl) {
	let agent = null;
	const resolveAgent = () => {
		if (!agent) agent = new ProxyAgent(proxyUrl);
		return agent;
	};
	const proxyFetch = ((input, init) => fetch(input, {
		...init,
		dispatcher: resolveAgent()
	}));
	Object.defineProperty(proxyFetch, PROXY_FETCH_PROXY_URL, {
		value: proxyUrl,
		enumerable: false,
		configurable: false,
		writable: false
	});
	return proxyFetch;
}
function getProxyUrlFromFetch(fetchImpl) {
	const proxyUrl = fetchImpl?.[PROXY_FETCH_PROXY_URL];
	if (typeof proxyUrl !== "string") return;
	const trimmed = proxyUrl.trim();
	return trimmed ? trimmed : void 0;
}
/**
* Resolve a proxy-aware fetch from standard environment variables
* (HTTPS_PROXY, HTTP_PROXY, https_proxy, http_proxy).
* Respects NO_PROXY / no_proxy exclusions via undici's EnvHttpProxyAgent.
* Returns undefined when no proxy is configured.
* Gracefully returns undefined if the proxy URL is malformed.
*/
function resolveProxyFetchFromEnv(env = process.env) {
	if (!hasEnvHttpProxyConfigured("https", env)) return;
	try {
		const agent = new EnvHttpProxyAgent();
		return ((input, init) => fetch(input, {
			...init,
			dispatcher: agent
		}));
	} catch (err) {
		logWarn(`Proxy env var set but agent creation failed — falling back to direct fetch: ${err instanceof Error ? err.message : String(err)}`);
		return;
	}
}
//#endregion
//#region src/agents/provider-attribution.ts
const OPENCLAW_ATTRIBUTION_PRODUCT = "OpenClaw";
const OPENCLAW_ATTRIBUTION_ORIGINATOR = "openclaw";
function resolveProviderAttributionIdentity(env = process.env) {
	return {
		product: OPENCLAW_ATTRIBUTION_PRODUCT,
		version: resolveRuntimeServiceVersion(env)
	};
}
function buildOpenRouterAttributionPolicy(env = process.env) {
	const identity = resolveProviderAttributionIdentity(env);
	return {
		provider: "openrouter",
		enabledByDefault: true,
		verification: "vendor-documented",
		hook: "request-headers",
		docsUrl: "https://openrouter.ai/docs/app-attribution",
		reviewNote: "Documented app attribution headers. Verified in OpenClaw runtime wrapper.",
		...identity,
		headers: {
			"HTTP-Referer": "https://openclaw.ai",
			"X-OpenRouter-Title": identity.product,
			"X-OpenRouter-Categories": "cli-agent"
		}
	};
}
function buildOpenAIAttributionPolicy(env = process.env) {
	const identity = resolveProviderAttributionIdentity(env);
	return {
		provider: "openai",
		enabledByDefault: true,
		verification: "vendor-hidden-api-spec",
		hook: "request-headers",
		reviewNote: "OpenAI native traffic supports hidden originator/User-Agent attribution. Verified against the Codex wire contract.",
		...identity,
		headers: {
			originator: OPENCLAW_ATTRIBUTION_ORIGINATOR,
			"User-Agent": `${OPENCLAW_ATTRIBUTION_ORIGINATOR}/${identity.version}`
		}
	};
}
function buildOpenAICodexAttributionPolicy(env = process.env) {
	const identity = resolveProviderAttributionIdentity(env);
	return {
		provider: "openai-codex",
		enabledByDefault: true,
		verification: "vendor-hidden-api-spec",
		hook: "request-headers",
		reviewNote: "OpenAI Codex ChatGPT-backed traffic supports the same hidden originator/User-Agent attribution contract.",
		...identity,
		headers: {
			originator: OPENCLAW_ATTRIBUTION_ORIGINATOR,
			"User-Agent": `${OPENCLAW_ATTRIBUTION_ORIGINATOR}/${identity.version}`
		}
	};
}
function buildSdkHookOnlyPolicy(provider, hook, reviewNote, env = process.env) {
	return {
		provider,
		enabledByDefault: false,
		verification: "vendor-sdk-hook-only",
		hook,
		reviewNote,
		...resolveProviderAttributionIdentity(env)
	};
}
function listProviderAttributionPolicies(env = process.env) {
	return [
		buildOpenRouterAttributionPolicy(env),
		buildOpenAIAttributionPolicy(env),
		buildOpenAICodexAttributionPolicy(env),
		buildSdkHookOnlyPolicy("anthropic", "default-headers", "Anthropic JS SDK exposes defaultHeaders, but app attribution is not yet verified.", env),
		buildSdkHookOnlyPolicy("google", "user-agent-extra", "Google GenAI JS SDK exposes userAgentExtra/httpOptions, but provider-side attribution is not yet verified.", env),
		buildSdkHookOnlyPolicy("groq", "default-headers", "Groq JS SDK exposes defaultHeaders, but app attribution is not yet verified.", env),
		buildSdkHookOnlyPolicy("mistral", "custom-user-agent", "Mistral JS SDK exposes a custom userAgent option, but app attribution is not yet verified.", env),
		buildSdkHookOnlyPolicy("together", "default-headers", "Together JS SDK exposes defaultHeaders, but app attribution is not yet verified.", env)
	];
}
function resolveProviderAttributionPolicy(provider, env = process.env) {
	const normalized = normalizeProviderId(provider ?? "");
	return listProviderAttributionPolicies(env).find((policy) => policy.provider === normalized);
}
function resolveProviderAttributionHeaders(provider, env = process.env) {
	const policy = resolveProviderAttributionPolicy(provider, env);
	if (!policy?.enabledByDefault) return;
	return policy.headers;
}
//#endregion
//#region src/agents/pi-embedded-runner/proxy-stream-wrappers.ts
const KILOCODE_FEATURE_HEADER = "X-KILOCODE-FEATURE";
const KILOCODE_FEATURE_DEFAULT = "openclaw";
const KILOCODE_FEATURE_ENV_VAR = "KILOCODE_FEATURE";
function resolveKilocodeAppHeaders() {
	const feature = process.env[KILOCODE_FEATURE_ENV_VAR]?.trim() || KILOCODE_FEATURE_DEFAULT;
	return { [KILOCODE_FEATURE_HEADER]: feature };
}
function isOpenRouterAnthropicModel(provider, modelId) {
	return provider.toLowerCase() === "openrouter" && modelId.toLowerCase().startsWith("anthropic/");
}
function mapThinkingLevelToOpenRouterReasoningEffort(thinkingLevel) {
	if (thinkingLevel === "off") return "none";
	if (thinkingLevel === "adaptive") return "medium";
	return thinkingLevel;
}
function normalizeProxyReasoningPayload(payload, thinkingLevel) {
	if (!payload || typeof payload !== "object") return;
	const payloadObj = payload;
	delete payloadObj.reasoning_effort;
	if (!thinkingLevel || thinkingLevel === "off") return;
	const existingReasoning = payloadObj.reasoning;
	if (existingReasoning && typeof existingReasoning === "object" && !Array.isArray(existingReasoning)) {
		const reasoningObj = existingReasoning;
		if (!("max_tokens" in reasoningObj) && !("effort" in reasoningObj)) reasoningObj.effort = mapThinkingLevelToOpenRouterReasoningEffort(thinkingLevel);
	} else if (!existingReasoning) payloadObj.reasoning = { effort: mapThinkingLevelToOpenRouterReasoningEffort(thinkingLevel) };
}
function createOpenRouterSystemCacheWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		if (typeof model.provider !== "string" || typeof model.id !== "string" || !isOpenRouterAnthropicModel(model.provider, model.id)) return underlying(model, context, options);
		const originalOnPayload = options?.onPayload;
		return underlying(model, context, {
			...options,
			onPayload: (payload) => {
				const messages = payload?.messages;
				if (Array.isArray(messages)) for (const msg of messages) {
					if (msg.role !== "system" && msg.role !== "developer") continue;
					if (typeof msg.content === "string") msg.content = [{
						type: "text",
						text: msg.content,
						cache_control: { type: "ephemeral" }
					}];
					else if (Array.isArray(msg.content) && msg.content.length > 0) {
						const last = msg.content[msg.content.length - 1];
						if (last && typeof last === "object") last.cache_control = { type: "ephemeral" };
					}
				}
				return originalOnPayload?.(payload, model);
			}
		});
	};
}
function createOpenRouterWrapper(baseStreamFn, thinkingLevel) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const onPayload = options?.onPayload;
		const attributionHeaders = resolveProviderAttributionHeaders("openrouter");
		return underlying(model, context, {
			...options,
			headers: {
				...attributionHeaders,
				...options?.headers
			},
			onPayload: (payload) => {
				normalizeProxyReasoningPayload(payload, thinkingLevel);
				return onPayload?.(payload, model);
			}
		});
	};
}
function isProxyReasoningUnsupported(modelId) {
	return modelId.toLowerCase().startsWith("x-ai/");
}
function createKilocodeWrapper(baseStreamFn, thinkingLevel) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const onPayload = options?.onPayload;
		return underlying(model, context, {
			...options,
			headers: {
				...options?.headers,
				...resolveKilocodeAppHeaders()
			},
			onPayload: (payload) => {
				normalizeProxyReasoningPayload(payload, thinkingLevel);
				return onPayload?.(payload, model);
			}
		});
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/moonshot-stream-wrappers.ts
function normalizeMoonshotThinkingType(value) {
	if (typeof value === "boolean") return value ? "enabled" : "disabled";
	if (typeof value === "string") {
		const normalized = value.trim().toLowerCase();
		if ([
			"enabled",
			"enable",
			"on",
			"true"
		].includes(normalized)) return "enabled";
		if ([
			"disabled",
			"disable",
			"off",
			"false"
		].includes(normalized)) return "disabled";
		return;
	}
	if (value && typeof value === "object" && !Array.isArray(value)) return normalizeMoonshotThinkingType(value.type);
}
function isMoonshotToolChoiceCompatible(toolChoice) {
	if (toolChoice == null || toolChoice === "auto" || toolChoice === "none") return true;
	if (typeof toolChoice === "object" && !Array.isArray(toolChoice)) {
		const typeValue = toolChoice.type;
		return typeValue === "auto" || typeValue === "none";
	}
	return false;
}
function isPinnedToolChoice(toolChoice) {
	if (!toolChoice || typeof toolChoice !== "object" || Array.isArray(toolChoice)) return false;
	const typeValue = toolChoice.type;
	return typeValue === "tool" || typeValue === "function";
}
function shouldApplySiliconFlowThinkingOffCompat(params) {
	return params.provider === "siliconflow" && params.thinkingLevel === "off" && params.modelId.startsWith("Pro/");
}
function shouldApplyMoonshotPayloadCompat(params) {
	const normalizedProvider = params.provider.trim().toLowerCase();
	const normalizedModelId = params.modelId.trim().toLowerCase();
	if (normalizedProvider === "moonshot") return true;
	return normalizedProvider === "ollama" && normalizedModelId.startsWith("kimi-k") && normalizedModelId.includes(":cloud");
}
function createSiliconFlowThinkingWrapper(baseStreamFn) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const originalOnPayload = options?.onPayload;
		return underlying(model, context, {
			...options,
			onPayload: (payload) => {
				if (payload && typeof payload === "object") {
					const payloadObj = payload;
					if (payloadObj.thinking === "off") payloadObj.thinking = null;
				}
				return originalOnPayload?.(payload, model);
			}
		});
	};
}
function resolveMoonshotThinkingType(params) {
	const configured = normalizeMoonshotThinkingType(params.configuredThinking);
	if (configured) return configured;
	if (!params.thinkingLevel) return;
	return params.thinkingLevel === "off" ? "disabled" : "enabled";
}
function createMoonshotThinkingWrapper(baseStreamFn, thinkingType) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		const originalOnPayload = options?.onPayload;
		return underlying(model, context, {
			...options,
			onPayload: (payload) => {
				if (payload && typeof payload === "object") {
					const payloadObj = payload;
					let effectiveThinkingType = normalizeMoonshotThinkingType(payloadObj.thinking);
					if (thinkingType) {
						payloadObj.thinking = { type: thinkingType };
						effectiveThinkingType = thinkingType;
					}
					if (effectiveThinkingType === "enabled" && !isMoonshotToolChoiceCompatible(payloadObj.tool_choice)) {
						if (payloadObj.tool_choice === "required") payloadObj.tool_choice = "auto";
						else if (isPinnedToolChoice(payloadObj.tool_choice)) payloadObj.thinking = { type: "disabled" };
					}
				}
				return originalOnPayload?.(payload, model);
			}
		});
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/zai-stream-wrappers.ts
/**
* Inject `tool_stream=true` for Z.AI requests so tool-call deltas stream in
* real time. Providers can disable this by setting `params.tool_stream=false`.
*/
function createZaiToolStreamWrapper(baseStreamFn, enabled) {
	const underlying = baseStreamFn ?? streamSimple;
	return (model, context, options) => {
		if (!enabled) return underlying(model, context, options);
		const originalOnPayload = options?.onPayload;
		return underlying(model, context, {
			...options,
			onPayload: (payload) => {
				if (payload && typeof payload === "object") payload.tool_stream = true;
				return originalOnPayload?.(payload, model);
			}
		});
	};
}
//#endregion
//#region src/agents/pi-embedded-runner/openrouter-model-capabilities.ts
/**
* Runtime OpenRouter model capability detection.
*
* When an OpenRouter model is not in the built-in static list, we look up its
* actual capabilities from a cached copy of the OpenRouter model catalog.
*
* Cache layers (checked in order):
* 1. In-memory Map (instant, cleared on process restart)
* 2. On-disk JSON file (<stateDir>/cache/openrouter-models.json)
* 3. OpenRouter API fetch (populates both layers)
*
* Model capabilities are assumed stable — the cache has no TTL expiry.
* A background refresh is triggered only when a model is not found in
* the cache (i.e. a newly added model on OpenRouter).
*
* Sync callers can read whatever is already cached. Async callers can await a
* one-time fetch so the first unknown-model lookup resolves with real
* capabilities instead of the text-only fallback.
*/
const log = createSubsystemLogger("openrouter-model-capabilities");
const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const FETCH_TIMEOUT_MS = 1e4;
const DISK_CACHE_FILENAME = "openrouter-models.json";
function resolveDiskCacheDir() {
	return join(resolveStateDir(), "cache");
}
function resolveDiskCachePath() {
	return join(resolveDiskCacheDir(), DISK_CACHE_FILENAME);
}
function writeDiskCache(map) {
	try {
		const cacheDir = resolveDiskCacheDir();
		if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
		const payload = { models: Object.fromEntries(map) };
		writeFileSync(resolveDiskCachePath(), JSON.stringify(payload), "utf-8");
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log.debug(`Failed to write OpenRouter disk cache: ${message}`);
	}
}
function isValidCapabilities(value) {
	if (!value || typeof value !== "object") return false;
	const record = value;
	return typeof record.name === "string" && Array.isArray(record.input) && typeof record.reasoning === "boolean" && typeof record.contextWindow === "number" && typeof record.maxTokens === "number";
}
function readDiskCache() {
	try {
		const cachePath = resolveDiskCachePath();
		if (!existsSync(cachePath)) return;
		const raw = readFileSync(cachePath, "utf-8");
		const payload = JSON.parse(raw);
		if (!payload || typeof payload !== "object") return;
		const models = payload.models;
		if (!models || typeof models !== "object") return;
		const map = /* @__PURE__ */ new Map();
		for (const [id, caps] of Object.entries(models)) if (isValidCapabilities(caps)) map.set(id, caps);
		return map.size > 0 ? map : void 0;
	} catch {
		return;
	}
}
let cache;
let fetchInFlight;
const skipNextMissRefresh = /* @__PURE__ */ new Set();
function parseModel(model) {
	const input = ["text"];
	if (((model.architecture?.modality ?? model.modality ?? "").split("->")[0] ?? "").includes("image")) input.push("image");
	return {
		name: model.name || model.id,
		input,
		reasoning: model.supported_parameters?.includes("reasoning") ?? false,
		contextWindow: model.context_length || 128e3,
		maxTokens: model.top_provider?.max_completion_tokens ?? model.max_completion_tokens ?? model.max_output_tokens ?? 8192,
		cost: {
			input: parseFloat(model.pricing?.prompt || "0") * 1e6,
			output: parseFloat(model.pricing?.completion || "0") * 1e6,
			cacheRead: parseFloat(model.pricing?.input_cache_read || "0") * 1e6,
			cacheWrite: parseFloat(model.pricing?.input_cache_write || "0") * 1e6
		}
	};
}
async function doFetch() {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
	try {
		const response = await (resolveProxyFetchFromEnv() ?? globalThis.fetch)(OPENROUTER_MODELS_URL, { signal: controller.signal });
		if (!response.ok) {
			log.warn(`OpenRouter models API returned ${response.status}`);
			return;
		}
		const models = (await response.json()).data ?? [];
		const map = /* @__PURE__ */ new Map();
		for (const model of models) {
			if (!model.id) continue;
			map.set(model.id, parseModel(model));
		}
		cache = map;
		writeDiskCache(map);
		log.debug(`Cached ${map.size} OpenRouter models from API`);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		log.warn(`Failed to fetch OpenRouter models: ${message}`);
	} finally {
		clearTimeout(timeout);
	}
}
function triggerFetch() {
	if (fetchInFlight) return;
	fetchInFlight = doFetch().finally(() => {
		fetchInFlight = void 0;
	});
}
/**
* Ensure the cache is populated. Checks in-memory first, then disk, then
* triggers a background API fetch as a last resort.
* Does not block — returns immediately.
*/
function ensureOpenRouterModelCache() {
	if (cache) return;
	const disk = readDiskCache();
	if (disk) {
		cache = disk;
		log.debug(`Loaded ${disk.size} OpenRouter models from disk cache`);
		return;
	}
	triggerFetch();
}
/**
* Ensure capabilities for a specific model are available before first use.
*
* Known cached entries return immediately. Unknown entries wait for at most
* one catalog fetch, then leave sync resolution to read from the populated
* cache on the same request.
*/
async function loadOpenRouterModelCapabilities(modelId) {
	ensureOpenRouterModelCache();
	if (cache?.has(modelId)) return;
	let fetchPromise = fetchInFlight;
	if (!fetchPromise) {
		triggerFetch();
		fetchPromise = fetchInFlight;
	}
	await fetchPromise;
	if (!cache?.has(modelId)) skipNextMissRefresh.add(modelId);
}
/**
* Synchronously look up model capabilities from the cache.
*
* If a model is not found but the cache exists, a background refresh is
* triggered in case it's a newly added model not yet in the cache.
*/
function getOpenRouterModelCapabilities(modelId) {
	ensureOpenRouterModelCache();
	const result = cache?.get(modelId);
	if (!result && skipNextMissRefresh.delete(modelId)) return;
	if (!result && cache && !fetchInFlight) triggerFetch();
	return result;
}
//#endregion
export { resolveProxyFetchFromEnv as _, createSiliconFlowThinkingWrapper as a, shouldApplySiliconFlowThinkingOffCompat as c, createOpenRouterWrapper as d, isProxyReasoningUnsupported as f, makeProxyFetch as g, getProxyUrlFromFetch as h, createMoonshotThinkingWrapper as i, createKilocodeWrapper as l, PROXY_FETCH_PROXY_URL as m, loadOpenRouterModelCapabilities as n, resolveMoonshotThinkingType as o, resolveProviderAttributionHeaders as p, createZaiToolStreamWrapper as r, shouldApplyMoonshotPayloadCompat as s, getOpenRouterModelCapabilities as t, createOpenRouterSystemCacheWrapper as u };
