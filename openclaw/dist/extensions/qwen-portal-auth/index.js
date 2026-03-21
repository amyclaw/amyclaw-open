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
import { vE as listProfilesForProvider, wE as ensureAuthProfileStore } from "../../auth-profiles-Bc6TPi0n.js";
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
import "../../provider-onboard-dAr3NUh2.js";
import "../../model-definitions-DwehIMlw.js";
import "../../diagnostic-D8TBqX9f.js";
import "../../message-hook-mappers-MHm61O7_.js";
import "../../json-store-Ct34wStR.js";
import "../../call-x5WvUEsz.js";
import "../../multimodal-BWF8MRkz.js";
import "../../memory-search-CHMV_-Bg.js";
import "../../query-expansion-CHmqSE4l.js";
import "../../search-manager-ByZ9OOyz.js";
import { c as buildOauthProviderAuthResult, n as definePluginEntry } from "../../core-TgQ7U3Ou.js";
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
import { n as toFormUrlEncoded, t as generatePkceVerifierChallenge } from "../../oauth-utils-Dkf1XBRP.js";
import { t as refreshQwenPortalCredentials } from "../../qwen-portal-auth-C7ZWgr9f.js";
import { randomUUID } from "node:crypto";
//#region extensions/qwen-portal-auth/oauth.ts
const QWEN_OAUTH_BASE_URL = "https://chat.qwen.ai";
const QWEN_OAUTH_DEVICE_CODE_ENDPOINT = `${QWEN_OAUTH_BASE_URL}/api/v1/oauth2/device/code`;
const QWEN_OAUTH_TOKEN_ENDPOINT = `${QWEN_OAUTH_BASE_URL}/api/v1/oauth2/token`;
const QWEN_OAUTH_CLIENT_ID = "f0304373b74a44d2b584a3fb70ca9e56";
const QWEN_OAUTH_SCOPE = "openid profile email model.completion";
const QWEN_OAUTH_GRANT_TYPE = "urn:ietf:params:oauth:grant-type:device_code";
async function requestDeviceCode(params) {
	const response = await fetch(QWEN_OAUTH_DEVICE_CODE_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Accept: "application/json",
			"x-request-id": randomUUID()
		},
		body: toFormUrlEncoded({
			client_id: QWEN_OAUTH_CLIENT_ID,
			scope: QWEN_OAUTH_SCOPE,
			code_challenge: params.challenge,
			code_challenge_method: "S256"
		})
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Qwen device authorization failed: ${text || response.statusText}`);
	}
	const payload = await response.json();
	if (!payload.device_code || !payload.user_code || !payload.verification_uri) throw new Error(payload.error ?? "Qwen device authorization returned an incomplete payload (missing user_code or verification_uri).");
	return payload;
}
async function pollDeviceToken(params) {
	const response = await fetch(QWEN_OAUTH_TOKEN_ENDPOINT, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Accept: "application/json"
		},
		body: toFormUrlEncoded({
			grant_type: QWEN_OAUTH_GRANT_TYPE,
			client_id: QWEN_OAUTH_CLIENT_ID,
			device_code: params.deviceCode,
			code_verifier: params.verifier
		})
	});
	if (!response.ok) {
		let payload;
		try {
			payload = await response.json();
		} catch {
			return {
				status: "error",
				message: await response.text() || response.statusText
			};
		}
		if (payload?.error === "authorization_pending") return { status: "pending" };
		if (payload?.error === "slow_down") return {
			status: "pending",
			slowDown: true
		};
		return {
			status: "error",
			message: payload?.error_description || payload?.error || response.statusText
		};
	}
	const tokenPayload = await response.json();
	if (!tokenPayload.access_token || !tokenPayload.refresh_token || !tokenPayload.expires_in) return {
		status: "error",
		message: "Qwen OAuth returned incomplete token payload."
	};
	return {
		status: "success",
		token: {
			access: tokenPayload.access_token,
			refresh: tokenPayload.refresh_token,
			expires: Date.now() + tokenPayload.expires_in * 1e3,
			resourceUrl: tokenPayload.resource_url
		}
	};
}
async function loginQwenPortalOAuth(params) {
	const { verifier, challenge } = generatePkceVerifierChallenge();
	const device = await requestDeviceCode({ challenge });
	const verificationUrl = device.verification_uri_complete || device.verification_uri;
	await params.note([`Open ${verificationUrl} to approve access.`, `If prompted, enter the code ${device.user_code}.`].join("\n"), "Qwen OAuth");
	try {
		await params.openUrl(verificationUrl);
	} catch {}
	const start = Date.now();
	let pollIntervalMs = device.interval ? device.interval * 1e3 : 2e3;
	const timeoutMs = device.expires_in * 1e3;
	while (Date.now() - start < timeoutMs) {
		params.progress.update("Waiting for Qwen OAuth approval…");
		const result = await pollDeviceToken({
			deviceCode: device.device_code,
			verifier
		});
		if (result.status === "success") return result.token;
		if (result.status === "error") throw new Error(`Qwen OAuth failed: ${result.message}`);
		if (result.status === "pending" && result.slowDown) pollIntervalMs = Math.min(pollIntervalMs * 1.5, 1e4);
		await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
	}
	throw new Error("Qwen OAuth timed out waiting for authorization.");
}
//#endregion
//#region extensions/qwen-portal-auth/provider-catalog.ts
const QWEN_PORTAL_BASE_URL = "https://portal.qwen.ai/v1";
const QWEN_PORTAL_DEFAULT_CONTEXT_WINDOW = 128e3;
const QWEN_PORTAL_DEFAULT_MAX_TOKENS = 8192;
const QWEN_PORTAL_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
function buildModelDefinition(params) {
	return {
		id: params.id,
		name: params.name,
		reasoning: false,
		input: params.input,
		cost: QWEN_PORTAL_DEFAULT_COST,
		contextWindow: QWEN_PORTAL_DEFAULT_CONTEXT_WINDOW,
		maxTokens: QWEN_PORTAL_DEFAULT_MAX_TOKENS
	};
}
function buildQwenPortalProvider() {
	return {
		baseUrl: QWEN_PORTAL_BASE_URL,
		api: "openai-completions",
		models: [buildModelDefinition({
			id: "coder-model",
			name: "Qwen Coder",
			input: ["text"]
		}), buildModelDefinition({
			id: "vision-model",
			name: "Qwen Vision",
			input: ["text", "image"]
		})]
	};
}
//#endregion
//#region extensions/qwen-portal-auth/index.ts
const PROVIDER_ID = "qwen-portal";
const PROVIDER_LABEL = "Qwen";
const DEFAULT_MODEL = "qwen-portal/coder-model";
const DEFAULT_BASE_URL = QWEN_PORTAL_BASE_URL;
function normalizeBaseUrl(value) {
	const raw = value?.trim() || DEFAULT_BASE_URL;
	const withProtocol = raw.startsWith("http") ? raw : `https://${raw}`;
	return withProtocol.endsWith("/v1") ? withProtocol : `${withProtocol.replace(/\/+$/, "")}/v1`;
}
function buildProviderCatalog(params) {
	return {
		...buildQwenPortalProvider(),
		baseUrl: params.baseUrl,
		apiKey: params.apiKey
	};
}
function resolveCatalog(ctx) {
	const explicitProvider = ctx.config.models?.providers?.[PROVIDER_ID];
	const envApiKey = ctx.resolveProviderApiKey(PROVIDER_ID).apiKey;
	const hasProfiles = listProfilesForProvider(ensureAuthProfileStore(ctx.agentDir, { allowKeychainPrompt: false }), PROVIDER_ID).length > 0;
	const explicitApiKey = typeof explicitProvider?.apiKey === "string" ? explicitProvider.apiKey.trim() : void 0;
	const apiKey = envApiKey ?? explicitApiKey ?? (hasProfiles ? "qwen-oauth" : void 0);
	if (!apiKey) return null;
	return { provider: buildProviderCatalog({
		baseUrl: normalizeBaseUrl(typeof explicitProvider?.baseUrl === "string" ? explicitProvider.baseUrl : void 0),
		apiKey
	}) };
}
var qwen_portal_auth_default = definePluginEntry({
	id: "qwen-portal-auth",
	name: "Qwen OAuth",
	description: "OAuth flow for Qwen (free-tier) models",
	register(api) {
		api.registerProvider({
			id: PROVIDER_ID,
			label: PROVIDER_LABEL,
			docsPath: "/providers/qwen",
			aliases: ["qwen"],
			envVars: ["QWEN_OAUTH_TOKEN", "QWEN_PORTAL_API_KEY"],
			catalog: { run: async (ctx) => resolveCatalog(ctx) },
			auth: [{
				id: "device",
				label: "Qwen OAuth",
				hint: "Device code login",
				kind: "device_code",
				run: async (ctx) => {
					const progress = ctx.prompter.progress("Starting Qwen OAuth…");
					try {
						const result = await loginQwenPortalOAuth({
							openUrl: ctx.openUrl,
							note: ctx.prompter.note,
							progress
						});
						progress.stop("Qwen OAuth complete");
						const baseUrl = normalizeBaseUrl(result.resourceUrl);
						return buildOauthProviderAuthResult({
							providerId: PROVIDER_ID,
							defaultModel: DEFAULT_MODEL,
							access: result.access,
							refresh: result.refresh,
							expires: result.expires,
							configPatch: {
								models: { providers: { [PROVIDER_ID]: {
									baseUrl,
									models: []
								} } },
								agents: { defaults: { models: {
									"qwen-portal/coder-model": { alias: "qwen" },
									"qwen-portal/vision-model": {}
								} } }
							},
							notes: ["Qwen OAuth tokens auto-refresh. Re-run login if refresh fails or access is revoked.", `Base URL defaults to ${DEFAULT_BASE_URL}. Override models.providers.${PROVIDER_ID}.baseUrl if needed.`]
						});
					} catch (err) {
						progress.stop("Qwen OAuth failed");
						await ctx.prompter.note("If OAuth fails, verify your Qwen account has portal access and try again.", "Qwen OAuth");
						throw err;
					}
				}
			}],
			wizard: { setup: {
				choiceId: "qwen-portal",
				choiceLabel: "Qwen OAuth",
				choiceHint: "Device code login",
				methodId: "device"
			} },
			refreshOAuth: async (cred) => ({
				...cred,
				...await refreshQwenPortalCredentials(cred),
				type: "oauth",
				provider: PROVIDER_ID,
				email: cred.email
			})
		});
	}
});
//#endregion
export { qwen_portal_auth_default as default };
