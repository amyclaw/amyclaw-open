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
import { Dm as createProviderApiKeyAuthMethod, gy as transcribeOpenAiCompatibleAudio } from "../../auth-profiles-Bc6TPi0n.js";
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
import { gt as buildMistralModelDefinition, mt as MISTRAL_DEFAULT_MODEL_ID, pt as MISTRAL_BASE_URL } from "../../provider-models-Cym0TctV.js";
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
//#region extensions/mistral/media-understanding-provider.ts
const DEFAULT_MISTRAL_AUDIO_BASE_URL = "https://api.mistral.ai/v1";
const DEFAULT_MISTRAL_AUDIO_MODEL = "voxtral-mini-latest";
const mistralMediaUnderstandingProvider = {
	id: "mistral",
	capabilities: ["audio"],
	transcribeAudio: async (req) => await transcribeOpenAiCompatibleAudio({
		...req,
		baseUrl: req.baseUrl ?? DEFAULT_MISTRAL_AUDIO_BASE_URL,
		defaultBaseUrl: DEFAULT_MISTRAL_AUDIO_BASE_URL,
		defaultModel: DEFAULT_MISTRAL_AUDIO_MODEL
	})
};
//#endregion
//#region extensions/mistral/onboard.ts
const MISTRAL_DEFAULT_MODEL_REF = `mistral/${MISTRAL_DEFAULT_MODEL_ID}`;
function applyMistralProviderConfig(cfg) {
	const models = { ...cfg.agents?.defaults?.models };
	models[MISTRAL_DEFAULT_MODEL_REF] = {
		...models[MISTRAL_DEFAULT_MODEL_REF],
		alias: models[MISTRAL_DEFAULT_MODEL_REF]?.alias ?? "Mistral"
	};
	return applyProviderConfigWithDefaultModel(cfg, {
		agentModels: models,
		providerId: "mistral",
		api: "openai-completions",
		baseUrl: MISTRAL_BASE_URL,
		defaultModel: buildMistralModelDefinition(),
		defaultModelId: MISTRAL_DEFAULT_MODEL_ID
	});
}
function applyMistralConfig(cfg) {
	return applyAgentDefaultModelPrimary(applyMistralProviderConfig(cfg), MISTRAL_DEFAULT_MODEL_REF);
}
//#endregion
//#region extensions/mistral/index.ts
const PROVIDER_ID = "mistral";
var mistral_default = definePluginEntry({
	id: PROVIDER_ID,
	name: "Mistral Provider",
	description: "Bundled Mistral provider plugin",
	register(api) {
		api.registerProvider({
			id: PROVIDER_ID,
			label: "Mistral",
			docsPath: "/providers/models",
			envVars: ["MISTRAL_API_KEY"],
			auth: [createProviderApiKeyAuthMethod({
				providerId: PROVIDER_ID,
				methodId: "api-key",
				label: "Mistral API key",
				hint: "API key",
				optionKey: "mistralApiKey",
				flagName: "--mistral-api-key",
				envVar: "MISTRAL_API_KEY",
				promptMessage: "Enter Mistral API key",
				defaultModel: MISTRAL_DEFAULT_MODEL_REF,
				expectedProviders: ["mistral"],
				applyConfig: (cfg) => applyMistralConfig(cfg),
				wizard: {
					choiceId: "mistral-api-key",
					choiceLabel: "Mistral API key",
					groupId: "mistral",
					groupLabel: "Mistral AI",
					groupHint: "API key"
				}
			})],
			capabilities: {
				transcriptToolCallIdMode: "strict9",
				transcriptToolCallIdModelHints: [
					"mistral",
					"mixtral",
					"codestral",
					"pixtral",
					"devstral",
					"ministral",
					"mistralai"
				]
			}
		});
		api.registerMediaUnderstandingProvider(mistralMediaUnderstandingProvider);
	}
});
//#endregion
export { mistral_default as default };
