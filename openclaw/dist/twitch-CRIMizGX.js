import { t as formatDocsLink } from "./links-DA9sitJV.js";
import { randomUUID } from "node:crypto";
//#region extensions/twitch/src/config.ts
/**
* Default account ID for Twitch
*/
const DEFAULT_ACCOUNT_ID = "default";
/**
* Get account config from core config
*
* Handles two patterns:
* 1. Simplified single-account: base-level properties create implicit "default" account
* 2. Multi-account: explicit accounts object
*
* For "default" account, base-level properties take precedence over accounts.default
* For other accounts, only the accounts object is checked
*/
function getAccountConfig(coreConfig, accountId) {
	if (!coreConfig || typeof coreConfig !== "object") return null;
	const twitchRaw = coreConfig.channels?.twitch;
	const accounts = twitchRaw?.accounts;
	if (accountId === "default") {
		const accountFromAccounts = accounts?.[DEFAULT_ACCOUNT_ID];
		const baseLevel = {
			username: typeof twitchRaw?.username === "string" ? twitchRaw.username : void 0,
			accessToken: typeof twitchRaw?.accessToken === "string" ? twitchRaw.accessToken : void 0,
			clientId: typeof twitchRaw?.clientId === "string" ? twitchRaw.clientId : void 0,
			channel: typeof twitchRaw?.channel === "string" ? twitchRaw.channel : void 0,
			enabled: typeof twitchRaw?.enabled === "boolean" ? twitchRaw.enabled : void 0,
			allowFrom: Array.isArray(twitchRaw?.allowFrom) ? twitchRaw.allowFrom : void 0,
			allowedRoles: Array.isArray(twitchRaw?.allowedRoles) ? twitchRaw.allowedRoles : void 0,
			requireMention: typeof twitchRaw?.requireMention === "boolean" ? twitchRaw.requireMention : void 0,
			clientSecret: typeof twitchRaw?.clientSecret === "string" ? twitchRaw.clientSecret : void 0,
			refreshToken: typeof twitchRaw?.refreshToken === "string" ? twitchRaw.refreshToken : void 0,
			expiresIn: typeof twitchRaw?.expiresIn === "number" ? twitchRaw.expiresIn : void 0,
			obtainmentTimestamp: typeof twitchRaw?.obtainmentTimestamp === "number" ? twitchRaw.obtainmentTimestamp : void 0
		};
		const merged = {
			...accountFromAccounts,
			...baseLevel
		};
		if (merged.username) return merged;
		if (accountFromAccounts) return accountFromAccounts;
		return null;
	}
	if (!accounts || !accounts[accountId]) return null;
	return accounts[accountId];
}
/**
* List all configured account IDs
*
* Includes both explicit accounts and implicit "default" from base-level config
*/
function listAccountIds(cfg) {
	const twitchRaw = cfg.channels?.twitch;
	const accountMap = twitchRaw?.accounts;
	const ids = [];
	if (accountMap) ids.push(...Object.keys(accountMap));
	if (twitchRaw && (typeof twitchRaw.username === "string" || typeof twitchRaw.accessToken === "string" || typeof twitchRaw.channel === "string") && !ids.includes("default")) ids.push(DEFAULT_ACCOUNT_ID);
	return ids;
}
//#endregion
//#region extensions/twitch/src/utils/twitch.ts
/**
* Twitch-specific utility functions
*/
/**
* Normalize Twitch channel names.
*
* Removes the '#' prefix if present, converts to lowercase, and trims whitespace.
* Twitch channel names are case-insensitive and don't use the '#' prefix in the API.
*
* @param channel - The channel name to normalize
* @returns Normalized channel name
*
* @example
* normalizeTwitchChannel("#TwitchChannel") // "twitchchannel"
* normalizeTwitchChannel("MyChannel") // "mychannel"
*/
function normalizeTwitchChannel(channel) {
	const trimmed = channel.trim().toLowerCase();
	return trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
}
/**
* Create a standardized error message for missing target.
*
* @param provider - The provider name (e.g., "Twitch")
* @param hint - Optional hint for how to fix the issue
* @returns Error object with descriptive message
*/
function missingTargetError(provider, hint) {
	return /* @__PURE__ */ new Error(`Delivering to ${provider} requires target${hint ? ` ${hint}` : ""}`);
}
/**
* Generate a unique message ID for Twitch messages.
*
* Twurple's say() doesn't return the message ID, so we generate one
* for tracking purposes.
*
* @returns A unique message ID
*/
function generateMessageId() {
	return `${Date.now()}-${randomUUID()}`;
}
/**
* Normalize OAuth token by removing the "oauth:" prefix if present.
*
* Twurple doesn't require the "oauth:" prefix, so we strip it for consistency.
*
* @param token - The OAuth token to normalize
* @returns Normalized token without "oauth:" prefix
*
* @example
* normalizeToken("oauth:abc123") // "abc123"
* normalizeToken("abc123") // "abc123"
*/
function normalizeToken(token) {
	return token.startsWith("oauth:") ? token.slice(6) : token;
}
/**
* Check if an account is properly configured with required credentials.
*
* @param account - The Twitch account config to check
* @returns true if the account has required credentials
*/
function isAccountConfigured(account, resolvedToken) {
	const token = resolvedToken ?? account?.accessToken;
	return Boolean(account?.username && token && account?.clientId);
}
//#endregion
//#region extensions/twitch/src/setup-surface.ts
/**
* Twitch setup wizard surface for CLI setup.
*/
const channel = "twitch";
function setTwitchAccount(cfg, account) {
	const existing = getAccountConfig(cfg, DEFAULT_ACCOUNT_ID);
	const merged = {
		username: account.username ?? existing?.username ?? "",
		accessToken: account.accessToken ?? existing?.accessToken ?? "",
		clientId: account.clientId ?? existing?.clientId ?? "",
		channel: account.channel ?? existing?.channel ?? "",
		enabled: account.enabled ?? existing?.enabled ?? true,
		allowFrom: account.allowFrom ?? existing?.allowFrom,
		allowedRoles: account.allowedRoles ?? existing?.allowedRoles,
		requireMention: account.requireMention ?? existing?.requireMention,
		clientSecret: account.clientSecret ?? existing?.clientSecret,
		refreshToken: account.refreshToken ?? existing?.refreshToken,
		expiresIn: account.expiresIn ?? existing?.expiresIn,
		obtainmentTimestamp: account.obtainmentTimestamp ?? existing?.obtainmentTimestamp
	};
	return {
		...cfg,
		channels: {
			...cfg.channels,
			twitch: {
				...cfg.channels?.twitch,
				enabled: true,
				accounts: {
					...(cfg.channels?.twitch)?.accounts,
					[DEFAULT_ACCOUNT_ID]: merged
				}
			}
		}
	};
}
async function noteTwitchSetupHelp(prompter) {
	await prompter.note([
		"Twitch requires a bot account with OAuth token.",
		"1. Create a Twitch application at https://dev.twitch.tv/console",
		"2. Generate a token with scopes: chat:read and chat:write",
		"   Use https://twitchtokengenerator.com/ or https://twitchapps.com/tmi/",
		"3. Copy the token (starts with 'oauth:') and Client ID",
		"Env vars supported: OPENCLAW_TWITCH_ACCESS_TOKEN",
		`Docs: ${formatDocsLink("/channels/twitch", "channels/twitch")}`
	].join("\n"), "Twitch setup");
}
async function promptToken(prompter, account, envToken) {
	const existingToken = account?.accessToken ?? "";
	if (existingToken && !envToken) {
		if (await prompter.confirm({
			message: "Access token already configured. Keep it?",
			initialValue: true
		})) return existingToken;
	}
	return String(await prompter.text({
		message: "Twitch OAuth token (oauth:...)",
		initialValue: envToken ?? "",
		validate: (value) => {
			const raw = String(value ?? "").trim();
			if (!raw) return "Required";
			if (!raw.startsWith("oauth:")) return "Token should start with 'oauth:'";
		}
	})).trim();
}
async function promptUsername(prompter, account) {
	return String(await prompter.text({
		message: "Twitch bot username",
		initialValue: account?.username ?? "",
		validate: (value) => value?.trim() ? void 0 : "Required"
	})).trim();
}
async function promptClientId(prompter, account) {
	return String(await prompter.text({
		message: "Twitch Client ID",
		initialValue: account?.clientId ?? "",
		validate: (value) => value?.trim() ? void 0 : "Required"
	})).trim();
}
async function promptChannelName(prompter, account) {
	return String(await prompter.text({
		message: "Channel to join",
		initialValue: account?.channel ?? "",
		validate: (value) => value?.trim() ? void 0 : "Required"
	})).trim();
}
async function promptRefreshTokenSetup(prompter, account) {
	if (!await prompter.confirm({
		message: "Enable automatic token refresh (requires client secret and refresh token)?",
		initialValue: Boolean(account?.clientSecret && account?.refreshToken)
	})) return {};
	return {
		clientSecret: String(await prompter.text({
			message: "Twitch Client Secret (for token refresh)",
			initialValue: account?.clientSecret ?? "",
			validate: (value) => value?.trim() ? void 0 : "Required"
		})).trim() || void 0,
		refreshToken: String(await prompter.text({
			message: "Twitch Refresh Token",
			initialValue: account?.refreshToken ?? "",
			validate: (value) => value?.trim() ? void 0 : "Required"
		})).trim() || void 0
	};
}
async function configureWithEnvToken(cfg, prompter, account, envToken, forceAllowFrom, dmPolicy) {
	if (!await prompter.confirm({
		message: "Twitch env var OPENCLAW_TWITCH_ACCESS_TOKEN detected. Use env token?",
		initialValue: true
	})) return null;
	const cfgWithAccount = setTwitchAccount(cfg, {
		username: await promptUsername(prompter, account),
		clientId: await promptClientId(prompter, account),
		accessToken: "",
		enabled: true
	});
	if (forceAllowFrom && dmPolicy.promptAllowFrom) return { cfg: await dmPolicy.promptAllowFrom({
		cfg: cfgWithAccount,
		prompter
	}) };
	return { cfg: cfgWithAccount };
}
function setTwitchAccessControl(cfg, allowedRoles, requireMention) {
	const account = getAccountConfig(cfg, DEFAULT_ACCOUNT_ID);
	if (!account) return cfg;
	return setTwitchAccount(cfg, {
		...account,
		allowedRoles,
		requireMention
	});
}
function resolveTwitchGroupPolicy(cfg) {
	const account = getAccountConfig(cfg, DEFAULT_ACCOUNT_ID);
	if (account?.allowedRoles?.includes("all")) return "open";
	if (account?.allowedRoles?.includes("moderator")) return "allowlist";
	return "disabled";
}
function setTwitchGroupPolicy(cfg, policy) {
	return setTwitchAccessControl(cfg, policy === "open" ? ["all"] : policy === "allowlist" ? ["moderator", "vip"] : [], true);
}
const twitchDmPolicy = {
	label: "Twitch",
	channel,
	policyKey: "channels.twitch.allowedRoles",
	allowFromKey: "channels.twitch.accounts.default.allowFrom",
	getCurrent: (cfg) => {
		const account = getAccountConfig(cfg, DEFAULT_ACCOUNT_ID);
		if (account?.allowedRoles?.includes("all")) return "open";
		if (account?.allowFrom && account.allowFrom.length > 0) return "allowlist";
		return "disabled";
	},
	setPolicy: (cfg, policy) => {
		return setTwitchAccessControl(cfg, policy === "open" ? ["all"] : policy === "allowlist" ? [] : ["moderator"], true);
	},
	promptAllowFrom: async ({ cfg, prompter }) => {
		const account = getAccountConfig(cfg, DEFAULT_ACCOUNT_ID);
		const existingAllowFrom = account?.allowFrom ?? [];
		const entry = await prompter.text({
			message: "Twitch allowFrom (user IDs, one per line, recommended for security)",
			placeholder: "123456789",
			initialValue: existingAllowFrom[0] ? String(existingAllowFrom[0]) : void 0
		});
		const allowFrom = String(entry ?? "").split(/[\n,;]+/g).map((s) => s.trim()).filter(Boolean);
		return setTwitchAccount(cfg, {
			...account ?? void 0,
			allowFrom
		});
	}
};
const twitchGroupAccess = {
	label: "Twitch chat",
	placeholder: "",
	skipAllowlistEntries: true,
	currentPolicy: ({ cfg }) => resolveTwitchGroupPolicy(cfg),
	currentEntries: ({ cfg }) => {
		return getAccountConfig(cfg, "default")?.allowFrom ?? [];
	},
	updatePrompt: ({ cfg }) => {
		const account = getAccountConfig(cfg, DEFAULT_ACCOUNT_ID);
		return Boolean(account?.allowedRoles?.length || account?.allowFrom?.length);
	},
	setPolicy: ({ cfg, policy }) => setTwitchGroupPolicy(cfg, policy),
	resolveAllowlist: async () => [],
	applyAllowlist: ({ cfg }) => cfg
};
const twitchSetupAdapter = {
	resolveAccountId: () => DEFAULT_ACCOUNT_ID,
	applyAccountConfig: ({ cfg }) => setTwitchAccount(cfg, { enabled: true })
};
const twitchSetupWizard = {
	channel,
	resolveAccountIdForConfigure: () => DEFAULT_ACCOUNT_ID,
	resolveShouldPromptAccountIds: () => false,
	status: {
		configuredLabel: "configured",
		unconfiguredLabel: "needs username, token, and clientId",
		configuredHint: "configured",
		unconfiguredHint: "needs setup",
		resolveConfigured: ({ cfg }) => {
			const account = getAccountConfig(cfg, DEFAULT_ACCOUNT_ID);
			return account ? isAccountConfigured(account) : false;
		},
		resolveStatusLines: ({ cfg }) => {
			const account = getAccountConfig(cfg, DEFAULT_ACCOUNT_ID);
			return [`Twitch: ${(account ? isAccountConfigured(account) : false) ? "configured" : "needs username, token, and clientId"}`];
		}
	},
	credentials: [],
	finalize: async ({ cfg, prompter, forceAllowFrom }) => {
		const account = getAccountConfig(cfg, DEFAULT_ACCOUNT_ID);
		if (!account || !isAccountConfigured(account)) await noteTwitchSetupHelp(prompter);
		const envToken = process.env.OPENCLAW_TWITCH_ACCESS_TOKEN?.trim();
		if (envToken && !account?.accessToken) {
			const envResult = await configureWithEnvToken(cfg, prompter, account, envToken, forceAllowFrom, twitchDmPolicy);
			if (envResult) return envResult;
		}
		const username = await promptUsername(prompter, account);
		const token = await promptToken(prompter, account, envToken);
		const clientId = await promptClientId(prompter, account);
		const channelName = await promptChannelName(prompter, account);
		const { clientSecret, refreshToken } = await promptRefreshTokenSetup(prompter, account);
		const cfgWithAccount = setTwitchAccount(cfg, {
			username,
			accessToken: token,
			clientId,
			channel: channelName,
			clientSecret,
			refreshToken,
			enabled: true
		});
		return { cfg: forceAllowFrom && twitchDmPolicy.promptAllowFrom ? await twitchDmPolicy.promptAllowFrom({
			cfg: cfgWithAccount,
			prompter
		}) : cfgWithAccount };
	},
	dmPolicy: twitchDmPolicy,
	groupAccess: twitchGroupAccess,
	disable: (cfg) => {
		const twitch = cfg.channels?.twitch;
		return {
			...cfg,
			channels: {
				...cfg.channels,
				twitch: {
					...twitch,
					enabled: false
				}
			}
		};
	}
};
//#endregion
export { missingTargetError as a, DEFAULT_ACCOUNT_ID as c, isAccountConfigured as i, getAccountConfig as l, twitchSetupWizard as n, normalizeToken as o, generateMessageId as r, normalizeTwitchChannel as s, twitchSetupAdapter as t, listAccountIds as u };
