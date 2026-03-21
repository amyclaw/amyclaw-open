import "./redact-fatrROh9.js";
import "./errors-DOJWZqNo.js";
import "./unhandled-rejections-BT0Rsc03.js";
import "./logger-ByBU4z1U.js";
import "./paths-1qR_mW4i.js";
import "./tmp-openclaw-dir-BDQ0wJ2G.js";
import "./theme-BSXzMzAA.js";
import "./globals-DqZvRoPX.js";
import "./subsystem-MGyxt_Bl.js";
import "./ansi-BPhP6LBZ.js";
import "./boolean-D8Ha5nYV.js";
import "./env-DlREndPb.js";
import "./warning-filter-Cg8_xqcp.js";
import "./utils-BMtC0Ocd.js";
import "./links-DA9sitJV.js";
import "./setup-binary-nB5GxsnS.js";
import { xd as resolvePluginWebSearchProviders } from "./auth-profiles-Bc6TPi0n.js";
import "./model-selection-DJOYg7Dx.js";
import "./agent-scope-B-OyGztR.js";
import "./boundary-file-read-Y1cMjPlu.js";
import "./logger-iZtdpoh6.js";
import "./exec-CwhzW0JB.js";
import "./workspace-Dns6NMt3.js";
import "./io-CezuVcrG.js";
import "./host-env-security-DnH8wzZ4.js";
import "./safe-text-BcUvBreN.js";
import "./version-BMIQmWNJ.js";
import { a as hasConfiguredSecretInput, l as normalizeSecretInputString, t as DEFAULT_SECRET_PROVIDER_ALIAS } from "./types.secrets-DuSPmmWB.js";
import "./env-substitution--sbeMYae.js";
import "./config-state-sYURQqD8.js";
import "./network-mode-nTYy2WxO.js";
import "./registry-jBzBWMf6.js";
import "./manifest-registry-BcOvH3_O.js";
import "./ip-w605xvSx.js";
import "./zod-schema.core-CWxzqcUs.js";
import "./config-CcaRAPg3.js";
import "./audit-fs-Cequ8jTw.js";
import "./resolve-D7R3Obgc.js";
import "./provider-web-search-DqPBRERs.js";
import "./text-runtime-Cv7IlZFR.js";
import "./workspace-dirs-B6rDmzuU.js";
import "./config-SJMQwqYd.js";
import "./tailnet-KyAU6tj_.js";
import "./net-B_Iq_SVP.js";
import "./credentials-B7GJXbww.js";
import "./routes-AlbnCYWi.js";
import "./frontmatter-BGJSb9Mh.js";
import "./env-overrides-SSye1Eey.js";
import "./path-alias-guards-B3ZKrId1.js";
import "./skills-D8mkwPU_.js";
import "./ports-D_2Jwnkx.js";
import "./ports-lsof-DiY6GaAf.js";
import "./ssh-tunnel-DFSJj-3E.js";
import "./image-ops-DM56IRtp.js";
import "./fs-safe-Ds1qsPxW.js";
import "./mime-_IkgFMS2.js";
import "./server-middleware-CsOOV2sU.js";
import "./message-channel-C4icaB2h.js";
import "./resolve-route-CUHslQlg.js";
import "./internal-hooks-CWvLyTiW.js";
import "./lazy-runtime-07jXxTa3.js";
import "./config-schema-GQ6uWjXe.js";
import "./method-scopes-BAswg77K.js";
import "./session-cost-usage-C3_3zEKV.js";
import "./paths-BumENdHQ.js";
import "./routing-3o2D0ix4.js";
import "./send-TDX_qI_x.js";
import "./node-resolve-DiVPimcG.js";
import "./provider-stream-DiwQl_xA.js";
import "./identity-file-B5i4_r6U.js";
import "./provider-models-Cym0TctV.js";
import "./secret-file-DRp-Ebe1.js";
import "./logging-BdFqMomc.js";
import "./runtime-env-CT-voxYE.js";
import "./registry-CeB-k--4.js";
import "./provider-onboard-dAr3NUh2.js";
import "./model-definitions-DwehIMlw.js";
import "./diagnostic-D8TBqX9f.js";
import "./message-hook-mappers-MHm61O7_.js";
import "./json-store-Ct34wStR.js";
import "./call-x5WvUEsz.js";
import "./multimodal-BWF8MRkz.js";
import "./memory-search-CHMV_-Bg.js";
import "./query-expansion-CHmqSE4l.js";
import "./search-manager-ByZ9OOyz.js";
import "./core-TgQ7U3Ou.js";
import "./issue-format-i6sEuV4a.js";
import "./logging-imcVaYUC.js";
import "./note-aKR6kEr4.js";
import "./state-paths-C7dX__ql.js";
import "./config-value-Cb6kcdav.js";
import "./command-secret-targets-Ow94fQb1.js";
import "./brave-wyq_csg5.js";
import "./provider-usage-La8jvEfN.js";
import "./perplexity-Cjiwa0zB.js";
import "./restart-stale-pids-OWmDUCi0.js";
import "./delivery-queue-BaPLohg3.js";
import "./pairing-token-sCwb75an.js";
import "./accounts-CXqzdDJl.js";
import "./process-runtime-CicRKAFe.js";
import "./audit-DTw2xid0.js";
import "./cli-runtime-DtIDS2w7.js";
import "./cli-utils-FHeUZLsT.js";
import "./help-format-1yV2Xzq7.js";
import "./progress-B4roBB_B.js";
import "./gateway-runtime-50-32dyb.js";
import { t as enablePluginInConfig } from "./enable-a23g-Kkz.js";
//#region src/commands/onboard-search.ts
const SEARCH_PROVIDER_IDS = [
	"brave",
	"firecrawl",
	"gemini",
	"grok",
	"kimi",
	"perplexity"
];
function isSearchProvider(value) {
	return SEARCH_PROVIDER_IDS.includes(value);
}
function hasSearchProviderId(provider) {
	return isSearchProvider(provider.id);
}
const SEARCH_PROVIDER_OPTIONS = resolvePluginWebSearchProviders({ bundledAllowlistCompat: true }).filter(hasSearchProviderId).map((provider) => ({
	value: provider.id,
	label: provider.label,
	hint: provider.hint,
	envKeys: provider.envVars,
	placeholder: provider.placeholder,
	signupUrl: provider.signupUrl
}));
function hasKeyInEnv(entry) {
	return entry.envKeys.some((k) => Boolean(process.env[k]?.trim()));
}
function rawKeyValue(config, provider) {
	const search = config.tools?.web?.search;
	return resolvePluginWebSearchProviders({
		config,
		bundledAllowlistCompat: true
	}).find((candidate) => candidate.id === provider)?.getCredentialValue(search);
}
/** Returns the plaintext key string, or undefined for SecretRefs/missing. */
function resolveExistingKey(config, provider) {
	return normalizeSecretInputString(rawKeyValue(config, provider));
}
/** Returns true if a key is configured (plaintext string or SecretRef). */
function hasExistingKey(config, provider) {
	return hasConfiguredSecretInput(rawKeyValue(config, provider));
}
/** Build an env-backed SecretRef for a search provider. */
function buildSearchEnvRef(provider) {
	const entry = SEARCH_PROVIDER_OPTIONS.find((e) => e.value === provider);
	const envVar = entry?.envKeys.find((k) => Boolean(process.env[k]?.trim())) ?? entry?.envKeys[0];
	if (!envVar) throw new Error(`No env var mapping for search provider "${provider}" in secret-input-mode=ref.`);
	return {
		source: "env",
		provider: DEFAULT_SECRET_PROVIDER_ALIAS,
		id: envVar
	};
}
/** Resolve a plaintext key into the appropriate SecretInput based on mode. */
function resolveSearchSecretInput(provider, key, secretInputMode) {
	if (secretInputMode === "ref") return buildSearchEnvRef(provider);
	return key;
}
function applySearchKey(config, provider, key) {
	const search = {
		...config.tools?.web?.search,
		provider,
		enabled: true
	};
	const entry = resolvePluginWebSearchProviders({
		config,
		bundledAllowlistCompat: true
	}).find((candidate) => candidate.id === provider);
	if (entry) entry.setCredentialValue(search, key);
	const next = {
		...config,
		tools: {
			...config.tools,
			web: {
				...config.tools?.web,
				search
			}
		}
	};
	if (provider !== "firecrawl") return next;
	return enablePluginInConfig(next, "firecrawl").config;
}
function applyProviderOnly(config, provider) {
	const next = {
		...config,
		tools: {
			...config.tools,
			web: {
				...config.tools?.web,
				search: {
					...config.tools?.web?.search,
					provider,
					enabled: true
				}
			}
		}
	};
	if (provider !== "firecrawl") return next;
	return enablePluginInConfig(next, "firecrawl").config;
}
function preserveDisabledState(original, result) {
	if (original.tools?.web?.search?.enabled !== false) return result;
	return {
		...result,
		tools: {
			...result.tools,
			web: {
				...result.tools?.web,
				search: {
					...result.tools?.web?.search,
					enabled: false
				}
			}
		}
	};
}
async function setupSearch(config, _runtime, prompter, opts) {
	await prompter.note([
		"Web search lets your agent look things up online.",
		"Choose a provider and paste your API key.",
		"Docs: https://docs.openclaw.ai/tools/web"
	].join("\n"), "Web search");
	const existingProvider = config.tools?.web?.search?.provider;
	const options = SEARCH_PROVIDER_OPTIONS.map((entry) => {
		const hint = hasExistingKey(config, entry.value) || hasKeyInEnv(entry) ? `${entry.hint} · configured` : entry.hint;
		return {
			value: entry.value,
			label: entry.label,
			hint
		};
	});
	const defaultProvider = (() => {
		if (existingProvider && SEARCH_PROVIDER_OPTIONS.some((e) => e.value === existingProvider)) return existingProvider;
		const detected = SEARCH_PROVIDER_OPTIONS.find((e) => hasExistingKey(config, e.value) || hasKeyInEnv(e));
		if (detected) return detected.value;
		return SEARCH_PROVIDER_OPTIONS[0].value;
	})();
	const choice = await prompter.select({
		message: "Search provider",
		options: [...options, {
			value: "__skip__",
			label: "Skip for now",
			hint: "Configure later with openclaw configure --section web"
		}],
		initialValue: defaultProvider
	});
	if (choice === "__skip__") return config;
	const entry = SEARCH_PROVIDER_OPTIONS.find((e) => e.value === choice);
	const existingKey = resolveExistingKey(config, choice);
	const keyConfigured = hasExistingKey(config, choice);
	const envAvailable = hasKeyInEnv(entry);
	if (opts?.quickstartDefaults && (keyConfigured || envAvailable)) return preserveDisabledState(config, existingKey ? applySearchKey(config, choice, existingKey) : applyProviderOnly(config, choice));
	if (opts?.secretInputMode === "ref") {
		if (keyConfigured) return preserveDisabledState(config, applyProviderOnly(config, choice));
		const ref = buildSearchEnvRef(choice);
		await prompter.note([
			"Secret references enabled — OpenClaw will store a reference instead of the API key.",
			`Env var: ${ref.id}${envAvailable ? " (detected)" : ""}.`,
			...envAvailable ? [] : [`Set ${ref.id} in the Gateway environment.`],
			"Docs: https://docs.openclaw.ai/tools/web"
		].join("\n"), "Web search");
		return applySearchKey(config, choice, ref);
	}
	const key = (await prompter.text({
		message: keyConfigured ? `${entry.label} API key (leave blank to keep current)` : envAvailable ? `${entry.label} API key (leave blank to use env var)` : `${entry.label} API key`,
		placeholder: keyConfigured ? "Leave blank to keep current" : entry.placeholder
	}))?.trim() ?? "";
	if (key) return applySearchKey(config, choice, resolveSearchSecretInput(choice, key, opts?.secretInputMode));
	if (existingKey) return preserveDisabledState(config, applySearchKey(config, choice, existingKey));
	if (keyConfigured || envAvailable) return preserveDisabledState(config, applyProviderOnly(config, choice));
	await prompter.note([
		"No API key stored — web_search won't work until a key is available.",
		`Get your key at: ${entry.signupUrl}`,
		"Docs: https://docs.openclaw.ai/tools/web"
	].join("\n"), "Web search");
	return {
		...config,
		tools: {
			...config.tools,
			web: {
				...config.tools?.web,
				search: {
					...config.tools?.web?.search,
					provider: choice
				}
			}
		}
	};
}
//#endregion
export { SEARCH_PROVIDER_OPTIONS, applySearchKey, hasExistingKey, hasKeyInEnv, resolveExistingKey, setupSearch };
