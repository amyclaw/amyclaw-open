import "../../logger-ByBU4z1U.js";
import "../../paths-1qR_mW4i.js";
import "../../tmp-openclaw-dir-BDQ0wJ2G.js";
import "../../theme-BSXzMzAA.js";
import "../../globals-DqZvRoPX.js";
import "../../subsystem-MGyxt_Bl.js";
import "../../ansi-BPhP6LBZ.js";
import "../../utils-BMtC0Ocd.js";
import "../../model-selection-DJOYg7Dx.js";
import "../../agent-scope-B-OyGztR.js";
import "../../boundary-file-read-Y1cMjPlu.js";
import "../../logger-iZtdpoh6.js";
import "../../exec-CwhzW0JB.js";
import "../../workspace-Dns6NMt3.js";
import "../../registry-jBzBWMf6.js";
import "../../resolve-route-CUHslQlg.js";
import { K as resolveOllamaApiBase, q as OLLAMA_DEFAULT_BASE_URL } from "../../provider-models-Cym0TctV.js";
import "../../secret-file-DRp-Ebe1.js";
import "../../provider-onboard-dAr3NUh2.js";
import "../../model-definitions-DwehIMlw.js";
import { n as definePluginEntry } from "../../core-TgQ7U3Ou.js";
//#region extensions/ollama/index.ts
const PROVIDER_ID = "ollama";
const DEFAULT_API_KEY = "ollama-local";
async function loadProviderSetup() {
	return await import("../../plugin-sdk/ollama-setup.js");
}
var ollama_default = definePluginEntry({
	id: "ollama",
	name: "Ollama Provider",
	description: "Bundled Ollama provider plugin",
	register(api) {
		api.registerProvider({
			id: PROVIDER_ID,
			label: "Ollama",
			docsPath: "/providers/ollama",
			envVars: ["OLLAMA_API_KEY"],
			auth: [{
				id: "local",
				label: "Ollama",
				hint: "Cloud and local open models",
				kind: "custom",
				run: async (ctx) => {
					const result = await (await loadProviderSetup()).promptAndConfigureOllama({
						cfg: ctx.config,
						prompter: ctx.prompter
					});
					return {
						profiles: [{
							profileId: "ollama:default",
							credential: {
								type: "api_key",
								provider: PROVIDER_ID,
								key: DEFAULT_API_KEY
							}
						}],
						configPatch: result.config,
						defaultModel: `ollama/${result.defaultModelId}`
					};
				},
				runNonInteractive: async (ctx) => {
					return await (await loadProviderSetup()).configureOllamaNonInteractive({
						nextConfig: ctx.config,
						opts: ctx.opts,
						runtime: ctx.runtime
					});
				}
			}],
			discovery: {
				order: "late",
				run: async (ctx) => {
					const explicit = ctx.config.models?.providers?.ollama;
					const hasExplicitModels = Array.isArray(explicit?.models) && explicit.models.length > 0;
					const ollamaKey = ctx.resolveProviderApiKey(PROVIDER_ID).apiKey;
					if (hasExplicitModels && explicit) return { provider: {
						...explicit,
						baseUrl: typeof explicit.baseUrl === "string" && explicit.baseUrl.trim() ? resolveOllamaApiBase(explicit.baseUrl) : OLLAMA_DEFAULT_BASE_URL,
						api: explicit.api ?? "ollama",
						apiKey: ollamaKey ?? explicit.apiKey ?? DEFAULT_API_KEY
					} };
					const provider = await (await loadProviderSetup()).buildOllamaProvider(explicit?.baseUrl, { quiet: !ollamaKey && !explicit });
					if (provider.models.length === 0 && !ollamaKey && !explicit?.apiKey) return null;
					return { provider: {
						...provider,
						apiKey: ollamaKey ?? explicit?.apiKey ?? DEFAULT_API_KEY
					} };
				}
			},
			wizard: {
				setup: {
					choiceId: "ollama",
					choiceLabel: "Ollama",
					choiceHint: "Cloud and local open models",
					groupId: "ollama",
					groupLabel: "Ollama",
					groupHint: "Cloud and local open models",
					methodId: "local"
				},
				modelPicker: {
					label: "Ollama (custom)",
					hint: "Detect models from a local or remote Ollama instance",
					methodId: "local"
				}
			},
			onModelSelected: async ({ config, model, prompter }) => {
				if (!model.startsWith("ollama/")) return;
				await (await loadProviderSetup()).ensureOllamaModelPulled({
					config,
					prompter
				});
			}
		});
	}
});
//#endregion
export { ollama_default as default };
