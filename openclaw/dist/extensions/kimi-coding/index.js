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
import { d as isRecord } from "../../utils-BMtC0Ocd.js";
import "../../links-DA9sitJV.js";
import "../../setup-binary-nB5GxsnS.js";
import { $b as KIMI_CODING_DEFAULT_MODEL_ID, Dm as createProviderApiKeyAuthMethod, Qb as KIMI_CODING_BASE_URL, ex as buildKimiCodingProvider } from "../../auth-profiles-Bc6TPi0n.js";
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
import "../../provider-stream-DiwQl_xA.js";
import "../../identity-file-B5i4_r6U.js";
import "../../provider-models-Cym0TctV.js";
import "../../secret-file-DRp-Ebe1.js";
import "../../logging-BdFqMomc.js";
import "../../runtime-env-CT-voxYE.js";
import "../../registry-CeB-k--4.js";
import { r as applyProviderConfigWithDefaultModel, t as applyAgentDefaultModelPrimary } from "../../provider-onboard-dAr3NUh2.js";
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
//#region extensions/kimi-coding/onboard.ts
const KIMI_MODEL_REF = `kimi/${KIMI_CODING_DEFAULT_MODEL_ID}`;
const KIMI_CODING_MODEL_REF = KIMI_MODEL_REF;
function applyKimiCodeProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[KIMI_MODEL_REF] = {
		...models[KIMI_MODEL_REF],
		alias: models[KIMI_MODEL_REF]?.alias ?? "Kimi"
	};
	const defaultModel = buildKimiCodingProvider().models[0];
	if (!defaultModel) return cfg;
	return applyProviderConfigWithDefaultModel(cfg, {
		agentModels: models,
		providerId: "kimi",
		api: "anthropic-messages",
		baseUrl: KIMI_CODING_BASE_URL,
		defaultModel,
		defaultModelId: KIMI_CODING_DEFAULT_MODEL_ID
	});
}
function applyKimiCodeConfig(cfg) {
	return applyAgentDefaultModelPrimary(applyKimiCodeProviderConfig(cfg), KIMI_MODEL_REF);
}
//#endregion
//#region extensions/kimi-coding/index.ts
const PLUGIN_ID = "kimi";
const PROVIDER_ID = "kimi";
var kimi_coding_default = definePluginEntry({
	id: PLUGIN_ID,
	name: "Kimi Provider",
	description: "Bundled Kimi provider plugin",
	register(api) {
		api.registerProvider({
			id: PROVIDER_ID,
			label: "Kimi",
			aliases: ["kimi-code", "kimi-coding"],
			docsPath: "/providers/moonshot",
			envVars: ["KIMI_API_KEY", "KIMICODE_API_KEY"],
			auth: [createProviderApiKeyAuthMethod({
				providerId: PROVIDER_ID,
				methodId: "api-key",
				label: "Kimi API key (subscription)",
				hint: "Kimi K2.5 + Kimi",
				optionKey: "kimiCodeApiKey",
				flagName: "--kimi-code-api-key",
				envVar: "KIMI_API_KEY",
				promptMessage: "Enter Kimi API key",
				defaultModel: KIMI_CODING_MODEL_REF,
				expectedProviders: [
					"kimi",
					"kimi-code",
					"kimi-coding"
				],
				applyConfig: (cfg) => applyKimiCodeConfig(cfg),
				noteMessage: ["Kimi uses a dedicated coding endpoint and API key.", "Get your API key at: https://www.kimi.com/code/en"].join("\n"),
				noteTitle: "Kimi",
				wizard: {
					choiceId: "kimi-code-api-key",
					choiceLabel: "Kimi API key (subscription)",
					groupId: "moonshot",
					groupLabel: "Moonshot AI (Kimi K2.5)",
					groupHint: "Kimi K2.5 + Kimi"
				}
			})],
			catalog: {
				order: "simple",
				run: async (ctx) => {
					const apiKey = ctx.resolveProviderApiKey(PROVIDER_ID).apiKey;
					if (!apiKey) return null;
					const explicitProvider = ctx.config.models?.providers?.[PROVIDER_ID];
					const builtInProvider = buildKimiCodingProvider();
					const explicitBaseUrl = typeof explicitProvider?.baseUrl === "string" ? explicitProvider.baseUrl.trim() : "";
					const explicitHeaders = isRecord(explicitProvider?.headers) ? explicitProvider.headers : void 0;
					return { provider: {
						...builtInProvider,
						...explicitBaseUrl ? { baseUrl: explicitBaseUrl } : {},
						...explicitHeaders ? { headers: {
							...builtInProvider.headers,
							...explicitHeaders
						} } : {},
						apiKey
					} };
				}
			},
			capabilities: { preserveAnthropicThinkingSignatures: false }
		});
	}
});
//#endregion
export { kimi_coding_default as default };
