import { t as formatDocsLink } from "./links-DA9sitJV.js";
import { Ew as applySetupAccountConfigPatch, HC as createAccountListHelpers, Mg as splitSetupEntries, Ow as createPatchedAccountSetupAdapter, cg as addWildcardAllowFrom, kw as migrateBaseNameToDefaultAccount, ug as mergeAllowFromEntries } from "./auth-profiles-Bc6TPi0n.js";
import { n as normalizeAccountId } from "./account-id-O4Og6DrK.js";
import { o as isSecretRef } from "./types.secrets-DuSPmmWB.js";
const googlechatSetupAdapter = createPatchedAccountSetupAdapter({
	channelKey: "googlechat",
	validateInput: ({ accountId, input }) => {
		if (input.useEnv && accountId !== "default") return "GOOGLE_CHAT_SERVICE_ACCOUNT env vars can only be used for the default account.";
		if (!input.useEnv && !input.token && !input.tokenFile) return "Google Chat requires --token (service account JSON) or --token-file.";
		return null;
	},
	buildPatch: (input) => {
		const patch = input.useEnv ? {} : input.tokenFile ? { serviceAccountFile: input.tokenFile } : input.token ? { serviceAccount: input.token } : {};
		const audienceType = input.audienceType?.trim();
		const audience = input.audience?.trim();
		const webhookPath = input.webhookPath?.trim();
		const webhookUrl = input.webhookUrl?.trim();
		return {
			...patch,
			...audienceType ? { audienceType } : {},
			...audience ? { audience } : {},
			...webhookPath ? { webhookPath } : {},
			...webhookUrl ? { webhookUrl } : {}
		};
	}
});
//#endregion
//#region extensions/googlechat/src/accounts.ts
const ENV_SERVICE_ACCOUNT$1 = "GOOGLE_CHAT_SERVICE_ACCOUNT";
const ENV_SERVICE_ACCOUNT_FILE$1 = "GOOGLE_CHAT_SERVICE_ACCOUNT_FILE";
const { listAccountIds: listGoogleChatAccountIds, resolveDefaultAccountId: resolveDefaultGoogleChatAccountId } = createAccountListHelpers("googlechat");
function resolveAccountConfig(cfg, accountId) {
	const accounts = cfg.channels?.["googlechat"]?.accounts;
	if (!accounts || typeof accounts !== "object") return;
	return accounts[accountId];
}
function mergeGoogleChatAccountConfig(cfg, accountId) {
	const { accounts: _ignored, defaultAccount: _ignored2, ...base } = cfg.channels?.["googlechat"] ?? {};
	const defaultAccountConfig = resolveAccountConfig(cfg, "default") ?? {};
	const account = resolveAccountConfig(cfg, accountId) ?? {};
	if (accountId === "default") return {
		...base,
		...defaultAccountConfig
	};
	const { enabled: _ignoredEnabled, dangerouslyAllowNameMatching: _ignoredDangerouslyAllowNameMatching, serviceAccount: _ignoredServiceAccount, serviceAccountRef: _ignoredServiceAccountRef, serviceAccountFile: _ignoredServiceAccountFile, ...defaultAccountShared } = defaultAccountConfig;
	return {
		...defaultAccountShared,
		...base,
		...account
	};
}
function parseServiceAccount(value) {
	if (value && typeof value === "object") {
		if (isSecretRef(value)) return null;
		return value;
	}
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	try {
		return JSON.parse(trimmed);
	} catch {
		return null;
	}
}
function resolveCredentialsFromConfig(params) {
	const { account, accountId } = params;
	const inline = parseServiceAccount(account.serviceAccount);
	if (inline) return {
		credentials: inline,
		source: "inline"
	};
	if (isSecretRef(account.serviceAccount)) throw new Error(`channels.googlechat.accounts.${accountId}.serviceAccount: unresolved SecretRef "${account.serviceAccount.source}:${account.serviceAccount.provider}:${account.serviceAccount.id}". Resolve this command against an active gateway runtime snapshot before reading it.`);
	if (isSecretRef(account.serviceAccountRef)) throw new Error(`channels.googlechat.accounts.${accountId}.serviceAccount: unresolved SecretRef "${account.serviceAccountRef.source}:${account.serviceAccountRef.provider}:${account.serviceAccountRef.id}". Resolve this command against an active gateway runtime snapshot before reading it.`);
	const file = account.serviceAccountFile?.trim();
	if (file) return {
		credentialsFile: file,
		source: "file"
	};
	if (accountId === "default") {
		const envJson = process.env[ENV_SERVICE_ACCOUNT$1];
		const envInline = parseServiceAccount(envJson);
		if (envInline) return {
			credentials: envInline,
			source: "env"
		};
		const envFile = process.env[ENV_SERVICE_ACCOUNT_FILE$1]?.trim();
		if (envFile) return {
			credentialsFile: envFile,
			source: "env"
		};
	}
	return { source: "none" };
}
function resolveGoogleChatAccount(params) {
	const accountId = normalizeAccountId(params.accountId);
	const baseEnabled = params.cfg.channels?.["googlechat"]?.enabled !== false;
	const merged = mergeGoogleChatAccountConfig(params.cfg, accountId);
	const accountEnabled = merged.enabled !== false;
	const enabled = baseEnabled && accountEnabled;
	const credentials = resolveCredentialsFromConfig({
		accountId,
		account: merged
	});
	return {
		accountId,
		name: merged.name?.trim() || void 0,
		enabled,
		config: merged,
		credentialSource: credentials.source,
		credentials: credentials.credentials,
		credentialsFile: credentials.credentialsFile
	};
}
function listEnabledGoogleChatAccounts(cfg) {
	return listGoogleChatAccountIds(cfg).map((accountId) => resolveGoogleChatAccount({
		cfg,
		accountId
	})).filter((account) => account.enabled);
}
//#endregion
//#region extensions/googlechat/src/setup-surface.ts
const channel = "googlechat";
const ENV_SERVICE_ACCOUNT = "GOOGLE_CHAT_SERVICE_ACCOUNT";
const ENV_SERVICE_ACCOUNT_FILE = "GOOGLE_CHAT_SERVICE_ACCOUNT_FILE";
const USE_ENV_FLAG = "__googlechatUseEnv";
const AUTH_METHOD_FLAG = "__googlechatAuthMethod";
function setGoogleChatDmPolicy(cfg, policy) {
	const allowFrom = policy === "open" ? addWildcardAllowFrom(cfg.channels?.googlechat?.dm?.allowFrom) : void 0;
	return {
		...cfg,
		channels: {
			...cfg.channels,
			googlechat: {
				...cfg.channels?.googlechat,
				dm: {
					...cfg.channels?.googlechat?.dm,
					policy,
					...allowFrom ? { allowFrom } : {}
				}
			}
		}
	};
}
async function promptAllowFrom(params) {
	const current = params.cfg.channels?.googlechat?.dm?.allowFrom ?? [];
	const entry = await params.prompter.text({
		message: "Google Chat allowFrom (users/<id> or raw email; avoid users/<email>)",
		placeholder: "users/123456789, name@example.com",
		initialValue: current[0] ? String(current[0]) : void 0,
		validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
	});
	const unique = mergeAllowFromEntries(void 0, splitSetupEntries(String(entry)));
	return {
		...params.cfg,
		channels: {
			...params.cfg.channels,
			googlechat: {
				...params.cfg.channels?.googlechat,
				enabled: true,
				dm: {
					...params.cfg.channels?.googlechat?.dm,
					policy: "allowlist",
					allowFrom: unique
				}
			}
		}
	};
}
const googlechatDmPolicy = {
	label: "Google Chat",
	channel,
	policyKey: "channels.googlechat.dm.policy",
	allowFromKey: "channels.googlechat.dm.allowFrom",
	getCurrent: (cfg) => cfg.channels?.googlechat?.dm?.policy ?? "pairing",
	setPolicy: (cfg, policy) => setGoogleChatDmPolicy(cfg, policy),
	promptAllowFrom
};
const googlechatSetupWizard = {
	channel,
	status: {
		configuredLabel: "configured",
		unconfiguredLabel: "needs service account",
		configuredHint: "configured",
		unconfiguredHint: "needs auth",
		resolveConfigured: ({ cfg }) => listGoogleChatAccountIds(cfg).some((accountId) => resolveGoogleChatAccount({
			cfg,
			accountId
		}).credentialSource !== "none"),
		resolveStatusLines: ({ cfg }) => {
			return [`Google Chat: ${listGoogleChatAccountIds(cfg).some((accountId) => resolveGoogleChatAccount({
				cfg,
				accountId
			}).credentialSource !== "none") ? "configured" : "needs service account"}`];
		}
	},
	introNote: {
		title: "Google Chat setup",
		lines: [
			"Google Chat apps use service-account auth and an HTTPS webhook.",
			"Set the Chat API scopes in your service account and configure the Chat app URL.",
			"Webhook verification requires audience type + audience value.",
			`Docs: ${formatDocsLink("/channels/googlechat", "googlechat")}`
		]
	},
	prepare: async ({ cfg, accountId, credentialValues, prompter }) => {
		if (accountId === "default" && (Boolean(process.env[ENV_SERVICE_ACCOUNT]) || Boolean(process.env[ENV_SERVICE_ACCOUNT_FILE]))) {
			if (await prompter.confirm({
				message: "Use GOOGLE_CHAT_SERVICE_ACCOUNT env vars?",
				initialValue: true
			})) return {
				cfg: applySetupAccountConfigPatch({
					cfg,
					channelKey: channel,
					accountId,
					patch: {}
				}),
				credentialValues: {
					...credentialValues,
					[USE_ENV_FLAG]: "1"
				}
			};
		}
		const method = await prompter.select({
			message: "Google Chat auth method",
			options: [{
				value: "file",
				label: "Service account JSON file"
			}, {
				value: "inline",
				label: "Paste service account JSON"
			}],
			initialValue: "file"
		});
		return { credentialValues: {
			...credentialValues,
			[USE_ENV_FLAG]: "0",
			[AUTH_METHOD_FLAG]: String(method)
		} };
	},
	credentials: [],
	textInputs: [{
		inputKey: "tokenFile",
		message: "Service account JSON path",
		placeholder: "/path/to/service-account.json",
		shouldPrompt: ({ credentialValues }) => credentialValues[USE_ENV_FLAG] !== "1" && credentialValues[AUTH_METHOD_FLAG] === "file",
		validate: ({ value }) => String(value ?? "").trim() ? void 0 : "Required",
		normalizeValue: ({ value }) => String(value).trim(),
		applySet: async ({ cfg, accountId, value }) => applySetupAccountConfigPatch({
			cfg,
			channelKey: channel,
			accountId,
			patch: { serviceAccountFile: value }
		})
	}, {
		inputKey: "token",
		message: "Service account JSON (single line)",
		placeholder: "{\"type\":\"service_account\", ... }",
		shouldPrompt: ({ credentialValues }) => credentialValues[USE_ENV_FLAG] !== "1" && credentialValues[AUTH_METHOD_FLAG] === "inline",
		validate: ({ value }) => String(value ?? "").trim() ? void 0 : "Required",
		normalizeValue: ({ value }) => String(value).trim(),
		applySet: async ({ cfg, accountId, value }) => applySetupAccountConfigPatch({
			cfg,
			channelKey: channel,
			accountId,
			patch: { serviceAccount: value }
		})
	}],
	finalize: async ({ cfg, accountId, prompter }) => {
		const account = resolveGoogleChatAccount({
			cfg,
			accountId
		});
		const audienceType = await prompter.select({
			message: "Webhook audience type",
			options: [{
				value: "app-url",
				label: "App URL (recommended)"
			}, {
				value: "project-number",
				label: "Project number"
			}],
			initialValue: account.config.audienceType === "project-number" ? "project-number" : "app-url"
		});
		const audience = await prompter.text({
			message: audienceType === "project-number" ? "Project number" : "App URL",
			placeholder: audienceType === "project-number" ? "1234567890" : "https://your.host/googlechat",
			initialValue: account.config.audience || void 0,
			validate: (value) => String(value ?? "").trim() ? void 0 : "Required"
		});
		return { cfg: migrateBaseNameToDefaultAccount({
			cfg: applySetupAccountConfigPatch({
				cfg,
				channelKey: channel,
				accountId,
				patch: {
					audienceType,
					audience: String(audience).trim()
				}
			}),
			channelKey: channel
		}) };
	},
	dmPolicy: googlechatDmPolicy
};
//#endregion
export { resolveGoogleChatAccount as a, resolveDefaultGoogleChatAccountId as i, listEnabledGoogleChatAccounts as n, googlechatSetupAdapter as o, listGoogleChatAccountIds as r, googlechatSetupWizard as t };
