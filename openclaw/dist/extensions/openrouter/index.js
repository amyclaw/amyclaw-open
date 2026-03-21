import "../../redact-fatrROh9.js";
import "../../errors-DOJWZqNo.js";
import "../../unhandled-rejections-BT0Rsc03.js";
import "../../logger-ByBU4z1U.js";
import "../../paths-1qR_mW4i.js";
import "../../tmp-openclaw-dir-BDQ0wJ2G.js";
import "../../theme-BSXzMzAA.js";
import "../../globals-DqZvRoPX.js";
import "../../subsystem-MGyxt_Bl.js";
import "../../ansi-BPhP6LBZ.js";
import "../../boolean-D8Ha5nYV.js";
import "../../env-DlREndPb.js";
import "../../warning-filter-Cg8_xqcp.js";
import "../../utils-BMtC0Ocd.js";
import "../../links-DA9sitJV.js";
import "../../setup-binary-nB5GxsnS.js";
import { Dm as createProviderApiKeyAuthMethod } from "../../auth-profiles-Bc6TPi0n.js";
import "../../model-selection-DJOYg7Dx.js";
import "../../agent-scope-B-OyGztR.js";
import "../../boundary-file-read-Y1cMjPlu.js";
import "../../logger-iZtdpoh6.js";
import "../../exec-CwhzW0JB.js";
import "../../workspace-Dns6NMt3.js";
import "../../io-CezuVcrG.js";
import "../../host-env-security-DnH8wzZ4.js";
import "../../safe-text-BcUvBreN.js";
import "../../version-BMIQmWNJ.js";
import "../../env-substitution--sbeMYae.js";
import "../../config-state-sYURQqD8.js";
import "../../network-mode-nTYy2WxO.js";
import "../../registry-jBzBWMf6.js";
import "../../manifest-registry-BcOvH3_O.js";
import "../../ip-w605xvSx.js";
import "../../zod-schema.core-CWxzqcUs.js";
import "../../config-CcaRAPg3.js";
import "../../audit-fs-Cequ8jTw.js";
import "../../resolve-D7R3Obgc.js";
import "../../provider-web-search-DqPBRERs.js";
import "../../text-runtime-Cv7IlZFR.js";
import "../../workspace-dirs-B6rDmzuU.js";
import "../../config-SJMQwqYd.js";
import "../../tailnet-KyAU6tj_.js";
import "../../net-B_Iq_SVP.js";
import "../../credentials-B7GJXbww.js";
import "../../routes-AlbnCYWi.js";
import "../../frontmatter-BGJSb9Mh.js";
import "../../env-overrides-SSye1Eey.js";
import "../../path-alias-guards-B3ZKrId1.js";
import "../../skills-D8mkwPU_.js";
import "../../ports-D_2Jwnkx.js";
import "../../ports-lsof-DiY6GaAf.js";
import "../../ssh-tunnel-DFSJj-3E.js";
import "../../image-ops-DM56IRtp.js";
import "../../fs-safe-Ds1qsPxW.js";
import "../../mime-_IkgFMS2.js";
import "../../server-middleware-CsOOV2sU.js";
import "../../message-channel-C4icaB2h.js";
import "../../resolve-route-CUHslQlg.js";
import "../../internal-hooks-CWvLyTiW.js";
import "../../lazy-runtime-07jXxTa3.js";
import "../../config-schema-GQ6uWjXe.js";
import "../../method-scopes-BAswg77K.js";
import "../../session-cost-usage-C3_3zEKV.js";
import "../../paths-BumENdHQ.js";
import "../../routing-3o2D0ix4.js";
import "../../send-TDX_qI_x.js";
import "../../node-resolve-DiVPimcG.js";
import { d as createOpenRouterWrapper, f as isProxyReasoningUnsupported, n as loadOpenRouterModelCapabilities, t as getOpenRouterModelCapabilities, u as createOpenRouterSystemCacheWrapper } from "../../provider-stream-DiwQl_xA.js";
import "../../identity-file-B5i4_r6U.js";
import "../../provider-models-Cym0TctV.js";
import "../../secret-file-DRp-Ebe1.js";
import "../../logging-BdFqMomc.js";
import "../../runtime-env-CT-voxYE.js";
import "../../registry-CeB-k--4.js";
import { t as applyAgentDefaultModelPrimary } from "../../provider-onboard-dAr3NUh2.js";
import "../../model-definitions-DwehIMlw.js";
import "../../diagnostic-D8TBqX9f.js";
import "../../message-hook-mappers-MHm61O7_.js";
import "../../json-store-Ct34wStR.js";
import "../../call-x5WvUEsz.js";
import "../../multimodal-BWF8MRkz.js";
import "../../memory-search-CHMV_-Bg.js";
import "../../query-expansion-CHmqSE4l.js";
import "../../search-manager-ByZ9OOyz.js";
import { n as definePluginEntry } from "../../core-TgQ7U3Ou.js";
import "../../issue-format-i6sEuV4a.js";
import "../../logging-imcVaYUC.js";
import "../../note-aKR6kEr4.js";
import "../../state-paths-C7dX__ql.js";
import "../../config-value-Cb6kcdav.js";
import "../../command-secret-targets-Ow94fQb1.js";
import "../../brave-wyq_csg5.js";
import "../../provider-usage-La8jvEfN.js";
import "../../perplexity-Cjiwa0zB.js";
import "../../restart-stale-pids-OWmDUCi0.js";
import "../../delivery-queue-BaPLohg3.js";
import "../../pairing-token-sCwb75an.js";
import "../../accounts-CXqzdDJl.js";
import "../../process-runtime-CicRKAFe.js";
import "../../audit-DTw2xid0.js";
import "../../cli-runtime-DtIDS2w7.js";
import "../../cli-utils-FHeUZLsT.js";
import "../../help-format-1yV2Xzq7.js";
import "../../progress-B4roBB_B.js";
import "../../gateway-runtime-50-32dyb.js";
//#region extensions/openrouter/onboard.ts
const OPENROUTER_DEFAULT_MODEL_REF = "openrouter/auto";
function applyOpenrouterProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[OPENROUTER_DEFAULT_MODEL_REF] = {
		...models[OPENROUTER_DEFAULT_MODEL_REF],
		alias: models["openrouter/auto"]?.alias ?? "OpenRouter"
	};
	return {
		...cfg,
		agents: {
			...cfg.agents,
			defaults: {
				...cfg.agents?.defaults,
				models
			}
		}
	};
}
function applyOpenrouterConfig(cfg) {
	return applyAgentDefaultModelPrimary(applyOpenrouterProviderConfig(cfg), OPENROUTER_DEFAULT_MODEL_REF);
}
//#endregion
//#region extensions/openrouter/provider-catalog.ts
const OPENROUTER_BASE_URL$1 = "https://openrouter.ai/api/v1";
const OPENROUTER_DEFAULT_MODEL_ID = "auto";
const OPENROUTER_DEFAULT_CONTEXT_WINDOW = 2e5;
const OPENROUTER_DEFAULT_MAX_TOKENS$1 = 8192;
const OPENROUTER_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
function buildOpenrouterProvider() {
	return {
		baseUrl: OPENROUTER_BASE_URL$1,
		api: "openai-completions",
		models: [
			{
				id: OPENROUTER_DEFAULT_MODEL_ID,
				name: "OpenRouter Auto",
				reasoning: false,
				input: ["text", "image"],
				cost: OPENROUTER_DEFAULT_COST,
				contextWindow: OPENROUTER_DEFAULT_CONTEXT_WINDOW,
				maxTokens: OPENROUTER_DEFAULT_MAX_TOKENS$1
			},
			{
				id: "openrouter/hunter-alpha",
				name: "Hunter Alpha",
				reasoning: true,
				input: ["text"],
				cost: OPENROUTER_DEFAULT_COST,
				contextWindow: 1048576,
				maxTokens: 65536
			},
			{
				id: "openrouter/healer-alpha",
				name: "Healer Alpha",
				reasoning: true,
				input: ["text", "image"],
				cost: OPENROUTER_DEFAULT_COST,
				contextWindow: 262144,
				maxTokens: 65536
			}
		]
	};
}
//#endregion
//#region extensions/openrouter/index.ts
const PROVIDER_ID = "openrouter";
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_DEFAULT_MAX_TOKENS = 8192;
const OPENROUTER_CACHE_TTL_MODEL_PREFIXES = [
	"anthropic/",
	"moonshot/",
	"moonshotai/",
	"zai/"
];
function buildDynamicOpenRouterModel(ctx) {
	const capabilities = getOpenRouterModelCapabilities(ctx.modelId);
	return {
		id: ctx.modelId,
		name: capabilities?.name ?? ctx.modelId,
		api: "openai-completions",
		provider: PROVIDER_ID,
		baseUrl: OPENROUTER_BASE_URL,
		reasoning: capabilities?.reasoning ?? false,
		input: capabilities?.input ?? ["text"],
		cost: capabilities?.cost ?? {
			input: 0,
			output: 0,
			cacheRead: 0,
			cacheWrite: 0
		},
		contextWindow: capabilities?.contextWindow ?? 2e5,
		maxTokens: capabilities?.maxTokens ?? OPENROUTER_DEFAULT_MAX_TOKENS
	};
}
function injectOpenRouterRouting(baseStreamFn, providerRouting) {
	if (!providerRouting) return baseStreamFn;
	return (model, context, options) => (baseStreamFn ?? ((nextModel, nextContext, nextOptions) => {
		throw new Error(`OpenRouter routing wrapper requires an underlying streamFn for ${String(nextModel.id)}.`);
	}))({
		...model,
		compat: {
			...model.compat,
			openRouterRouting: providerRouting
		}
	}, context, options);
}
function isOpenRouterCacheTtlModel(modelId) {
	return OPENROUTER_CACHE_TTL_MODEL_PREFIXES.some((prefix) => modelId.startsWith(prefix));
}
var openrouter_default = definePluginEntry({
	id: "openrouter",
	name: "OpenRouter Provider",
	description: "Bundled OpenRouter provider plugin",
	register(api) {
		api.registerProvider({
			id: PROVIDER_ID,
			label: "OpenRouter",
			docsPath: "/providers/models",
			envVars: ["OPENROUTER_API_KEY"],
			auth: [createProviderApiKeyAuthMethod({
				providerId: PROVIDER_ID,
				methodId: "api-key",
				label: "OpenRouter API key",
				hint: "API key",
				optionKey: "openrouterApiKey",
				flagName: "--openrouter-api-key",
				envVar: "OPENROUTER_API_KEY",
				promptMessage: "Enter OpenRouter API key",
				defaultModel: OPENROUTER_DEFAULT_MODEL_REF,
				expectedProviders: ["openrouter"],
				applyConfig: (cfg) => applyOpenrouterConfig(cfg),
				wizard: {
					choiceId: "openrouter-api-key",
					choiceLabel: "OpenRouter API key",
					groupId: "openrouter",
					groupLabel: "OpenRouter",
					groupHint: "API key"
				}
			})],
			catalog: {
				order: "simple",
				run: async (ctx) => {
					const apiKey = ctx.resolveProviderApiKey(PROVIDER_ID).apiKey;
					if (!apiKey) return null;
					return { provider: {
						...buildOpenrouterProvider(),
						apiKey
					} };
				}
			},
			resolveDynamicModel: (ctx) => buildDynamicOpenRouterModel(ctx),
			prepareDynamicModel: async (ctx) => {
				await loadOpenRouterModelCapabilities(ctx.modelId);
			},
			capabilities: {
				openAiCompatTurnValidation: false,
				geminiThoughtSignatureSanitization: true,
				geminiThoughtSignatureModelHints: ["gemini"]
			},
			isModernModelRef: () => true,
			wrapStreamFn: (ctx) => {
				let streamFn = ctx.streamFn;
				const providerRouting = ctx.extraParams?.provider != null && typeof ctx.extraParams.provider === "object" ? ctx.extraParams.provider : void 0;
				if (providerRouting) streamFn = injectOpenRouterRouting(streamFn, providerRouting);
				const openRouterThinkingLevel = ctx.modelId === "auto" || isProxyReasoningUnsupported(ctx.modelId) ? void 0 : ctx.thinkingLevel;
				streamFn = createOpenRouterWrapper(streamFn, openRouterThinkingLevel);
				streamFn = createOpenRouterSystemCacheWrapper(streamFn);
				return streamFn;
			},
			isCacheTtlEligible: (ctx) => isOpenRouterCacheTtlModel(ctx.modelId)
		});
	}
});
//#endregion
export { openrouter_default as default };
