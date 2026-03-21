import { t as formatDocsLink } from "./links-DA9sitJV.js";
import { Mw as prepareScopedSetupConfig, jw as patchScopedAccountConfig } from "./auth-profiles-Bc6TPi0n.js";
import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "./account-id-O4Og6DrK.js";
import { g as isBlockedHostnameOrIp } from "./image-ops-DM56IRtp.js";
//#region extensions/tlon/src/account-fields.ts
function buildTlonAccountFields(input) {
	return {
		...input.ship ? { ship: input.ship } : {},
		...input.url ? { url: input.url } : {},
		...input.code ? { code: input.code } : {},
		...typeof input.allowPrivateNetwork === "boolean" ? { allowPrivateNetwork: input.allowPrivateNetwork } : {},
		...input.groupChannels ? { groupChannels: input.groupChannels } : {},
		...input.dmAllowlist ? { dmAllowlist: input.dmAllowlist } : {},
		...typeof input.autoDiscoverChannels === "boolean" ? { autoDiscoverChannels: input.autoDiscoverChannels } : {},
		...input.ownerShip ? { ownerShip: input.ownerShip } : {}
	};
}
//#endregion
//#region extensions/tlon/src/targets.ts
const SHIP_RE = /^~?[a-z-]+$/i;
const NEST_RE = /^chat\/([^/]+)\/([^/]+)$/i;
function normalizeShip(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return trimmed;
	return trimmed.startsWith("~") ? trimmed : `~${trimmed}`;
}
function parseChannelNest(raw) {
	const match = NEST_RE.exec(raw.trim());
	if (!match) return null;
	return {
		hostShip: normalizeShip(match[1]),
		channelName: match[2]
	};
}
function parseTlonTarget(raw) {
	const trimmed = raw?.trim();
	if (!trimmed) return null;
	const withoutPrefix = trimmed.replace(/^tlon:/i, "");
	const dmPrefix = withoutPrefix.match(/^dm[/:](.+)$/i);
	if (dmPrefix) return {
		kind: "dm",
		ship: normalizeShip(dmPrefix[1])
	};
	const groupPrefix = withoutPrefix.match(/^(group|room)[/:](.+)$/i);
	if (groupPrefix) {
		const groupTarget = groupPrefix[2].trim();
		if (groupTarget.startsWith("chat/")) {
			const parsed = parseChannelNest(groupTarget);
			if (!parsed) return null;
			return {
				kind: "group",
				nest: `chat/${parsed.hostShip}/${parsed.channelName}`,
				hostShip: parsed.hostShip,
				channelName: parsed.channelName
			};
		}
		const parts = groupTarget.split("/");
		if (parts.length === 2) {
			const hostShip = normalizeShip(parts[0]);
			const channelName = parts[1];
			return {
				kind: "group",
				nest: `chat/${hostShip}/${channelName}`,
				hostShip,
				channelName
			};
		}
		return null;
	}
	if (withoutPrefix.startsWith("chat/")) {
		const parsed = parseChannelNest(withoutPrefix);
		if (!parsed) return null;
		return {
			kind: "group",
			nest: `chat/${parsed.hostShip}/${parsed.channelName}`,
			hostShip: parsed.hostShip,
			channelName: parsed.channelName
		};
	}
	if (SHIP_RE.test(withoutPrefix)) return {
		kind: "dm",
		ship: normalizeShip(withoutPrefix)
	};
	return null;
}
function resolveTlonOutboundTarget(to) {
	const parsed = parseTlonTarget(to ?? "");
	if (!parsed) return {
		ok: false,
		error: /* @__PURE__ */ new Error(`Invalid Tlon target. Use ${formatTargetHint()}`)
	};
	if (parsed.kind === "dm") return {
		ok: true,
		to: parsed.ship
	};
	return {
		ok: true,
		to: parsed.nest
	};
}
function formatTargetHint() {
	return "dm/~sampel-palnet | ~sampel-palnet | chat/~host-ship/channel | group:~host-ship/channel";
}
//#endregion
//#region extensions/tlon/src/types.ts
function resolveTlonAccount(cfg, accountId) {
	const base = cfg.channels?.tlon;
	if (!base) return {
		accountId: accountId || "default",
		name: null,
		enabled: false,
		configured: false,
		ship: null,
		url: null,
		code: null,
		allowPrivateNetwork: null,
		groupChannels: [],
		dmAllowlist: [],
		groupInviteAllowlist: [],
		autoDiscoverChannels: null,
		showModelSignature: null,
		autoAcceptDmInvites: null,
		autoAcceptGroupInvites: null,
		defaultAuthorizedShips: [],
		ownerShip: null
	};
	const account = !accountId || accountId === "default" ? base : base.accounts?.[accountId];
	const ship = account?.ship ?? base.ship ?? null;
	const url = account?.url ?? base.url ?? null;
	const code = account?.code ?? base.code ?? null;
	const allowPrivateNetwork = account?.allowPrivateNetwork ?? base.allowPrivateNetwork ?? null;
	const groupChannels = account?.groupChannels ?? base.groupChannels ?? [];
	const dmAllowlist = account?.dmAllowlist ?? base.dmAllowlist ?? [];
	const groupInviteAllowlist = account?.groupInviteAllowlist ?? base.groupInviteAllowlist ?? [];
	const autoDiscoverChannels = account?.autoDiscoverChannels ?? base.autoDiscoverChannels ?? null;
	const showModelSignature = account?.showModelSignature ?? base.showModelSignature ?? null;
	const autoAcceptDmInvites = account?.autoAcceptDmInvites ?? base.autoAcceptDmInvites ?? null;
	const autoAcceptGroupInvites = account?.autoAcceptGroupInvites ?? base.autoAcceptGroupInvites ?? null;
	const ownerShip = account?.ownerShip ?? base.ownerShip ?? null;
	const defaultAuthorizedShips = account?.defaultAuthorizedShips ?? base?.defaultAuthorizedShips ?? [];
	const configured = Boolean(ship && url && code);
	return {
		accountId: accountId || "default",
		name: account?.name ?? base.name ?? null,
		enabled: (account?.enabled ?? base.enabled ?? true) !== false,
		configured,
		ship,
		url,
		code,
		allowPrivateNetwork,
		groupChannels,
		dmAllowlist,
		groupInviteAllowlist,
		autoDiscoverChannels,
		showModelSignature,
		autoAcceptDmInvites,
		autoAcceptGroupInvites,
		defaultAuthorizedShips,
		ownerShip
	};
}
function listTlonAccountIds(cfg) {
	const base = cfg.channels?.tlon;
	if (!base) return [];
	const accounts = base.accounts ?? {};
	return [...base.ship ? ["default"] : [], ...Object.keys(accounts)];
}
//#endregion
//#region extensions/tlon/src/urbit/base-url.ts
function hasScheme(value) {
	return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(value);
}
function validateUrbitBaseUrl(raw) {
	const trimmed = String(raw ?? "").trim();
	if (!trimmed) return {
		ok: false,
		error: "Required"
	};
	const candidate = hasScheme(trimmed) ? trimmed : `https://${trimmed}`;
	let parsed;
	try {
		parsed = new URL(candidate);
	} catch {
		return {
			ok: false,
			error: "Invalid URL"
		};
	}
	if (!["http:", "https:"].includes(parsed.protocol)) return {
		ok: false,
		error: "URL must use http:// or https://"
	};
	if (parsed.username || parsed.password) return {
		ok: false,
		error: "URL must not include credentials"
	};
	const hostname = parsed.hostname.trim().toLowerCase().replace(/\.$/, "");
	if (!hostname) return {
		ok: false,
		error: "Invalid hostname"
	};
	const isIpv6 = hostname.includes(":");
	const host = parsed.port ? `${isIpv6 ? `[${hostname}]` : hostname}:${parsed.port}` : isIpv6 ? `[${hostname}]` : hostname;
	return {
		ok: true,
		baseUrl: `${parsed.protocol}//${host}`,
		hostname
	};
}
function isBlockedUrbitHostname(hostname) {
	const normalized = hostname.trim().toLowerCase().replace(/\.$/, "");
	if (!normalized) return false;
	return isBlockedHostnameOrIp(normalized);
}
//#endregion
//#region extensions/tlon/src/setup-core.ts
const channel = "tlon";
function isConfigured(account) {
	return Boolean(account.ship && account.url && account.code);
}
function createTlonSetupWizardBase(params) {
	return {
		channel,
		status: {
			configuredLabel: "configured",
			unconfiguredLabel: "needs setup",
			configuredHint: "configured",
			unconfiguredHint: "urbit messenger",
			configuredScore: 1,
			unconfiguredScore: 4,
			resolveConfigured: ({ cfg }) => params.resolveConfigured({ cfg }),
			resolveStatusLines: ({ cfg, configured }) => params.resolveStatusLines?.({
				cfg,
				configured
			}) ?? []
		},
		introNote: {
			title: "Tlon setup",
			lines: [
				"You need your Urbit ship URL and login code.",
				"Example URL: https://your-ship-host",
				"Example ship: ~sampel-palnet",
				"If your ship URL is on a private network (LAN/localhost), you must explicitly allow it during setup.",
				`Docs: ${formatDocsLink("/channels/tlon", "channels/tlon")}`
			]
		},
		credentials: [],
		textInputs: [
			{
				inputKey: "ship",
				message: "Ship name",
				placeholder: "~sampel-palnet",
				currentValue: ({ cfg, accountId }) => resolveTlonAccount(cfg, accountId).ship ?? void 0,
				validate: ({ value }) => String(value ?? "").trim() ? void 0 : "Required",
				normalizeValue: ({ value }) => normalizeShip(String(value).trim()),
				applySet: async ({ cfg, accountId, value }) => applyTlonSetupConfig({
					cfg,
					accountId,
					input: { ship: value }
				})
			},
			{
				inputKey: "url",
				message: "Ship URL",
				placeholder: "https://your-ship-host",
				currentValue: ({ cfg, accountId }) => resolveTlonAccount(cfg, accountId).url ?? void 0,
				validate: ({ value }) => {
					const next = validateUrbitBaseUrl(String(value ?? ""));
					if (!next.ok) return next.error;
				},
				normalizeValue: ({ value }) => String(value).trim(),
				applySet: async ({ cfg, accountId, value }) => applyTlonSetupConfig({
					cfg,
					accountId,
					input: { url: value }
				})
			},
			{
				inputKey: "code",
				message: "Login code",
				placeholder: "lidlut-tabwed-pillex-ridrup",
				currentValue: ({ cfg, accountId }) => resolveTlonAccount(cfg, accountId).code ?? void 0,
				validate: ({ value }) => String(value ?? "").trim() ? void 0 : "Required",
				normalizeValue: ({ value }) => String(value).trim(),
				applySet: async ({ cfg, accountId, value }) => applyTlonSetupConfig({
					cfg,
					accountId,
					input: { code: value }
				})
			}
		],
		finalize: params.finalize
	};
}
async function resolveTlonSetupConfigured(cfg) {
	const accountIds = listTlonAccountIds(cfg);
	return accountIds.length > 0 ? accountIds.some((accountId) => isConfigured(resolveTlonAccount(cfg, accountId))) : isConfigured(resolveTlonAccount(cfg, DEFAULT_ACCOUNT_ID));
}
async function resolveTlonSetupStatusLines(cfg) {
	return [`Tlon: ${await resolveTlonSetupConfigured(cfg) ? "configured" : "needs setup"}`];
}
function applyTlonSetupConfig(params) {
	const { cfg, accountId, input } = params;
	const useDefault = accountId === DEFAULT_ACCOUNT_ID;
	const namedConfig = prepareScopedSetupConfig({
		cfg,
		channelKey: channel,
		accountId,
		name: input.name
	});
	const base = namedConfig.channels?.tlon ?? {};
	const payload = buildTlonAccountFields(input);
	if (useDefault) return {
		...namedConfig,
		channels: {
			...namedConfig.channels,
			tlon: {
				...base,
				enabled: true,
				...payload
			}
		}
	};
	return patchScopedAccountConfig({
		cfg: namedConfig,
		channelKey: channel,
		accountId,
		patch: { enabled: base.enabled ?? true },
		accountPatch: {
			enabled: true,
			...payload
		},
		ensureChannelEnabled: false,
		ensureAccountEnabled: false
	});
}
const tlonSetupAdapter = {
	resolveAccountId: ({ accountId }) => normalizeAccountId(accountId),
	applyAccountName: ({ cfg, accountId, name }) => prepareScopedSetupConfig({
		cfg,
		channelKey: channel,
		accountId,
		name
	}),
	validateInput: ({ cfg, accountId, input }) => {
		const setupInput = input;
		const resolved = resolveTlonAccount(cfg, accountId ?? void 0);
		const ship = setupInput.ship?.trim() || resolved.ship;
		const url = setupInput.url?.trim() || resolved.url;
		const code = setupInput.code?.trim() || resolved.code;
		if (!ship) return "Tlon requires --ship.";
		if (!url) return "Tlon requires --url.";
		if (!code) return "Tlon requires --code.";
		return null;
	},
	applyAccountConfig: ({ cfg, accountId, input }) => applyTlonSetupConfig({
		cfg,
		accountId,
		input
	})
};
//#endregion
//#region extensions/tlon/src/setup-surface.ts
function parseList(value) {
	return value.split(/[\n,;]+/g).map((entry) => entry.trim()).filter(Boolean);
}
const tlonSetupWizard = createTlonSetupWizardBase({
	resolveConfigured: async ({ cfg }) => await resolveTlonSetupConfigured(cfg),
	resolveStatusLines: async ({ cfg }) => await resolveTlonSetupStatusLines(cfg),
	finalize: async ({ cfg, accountId, prompter }) => {
		let next = cfg;
		const resolved = resolveTlonAccount(next, accountId);
		const validatedUrl = validateUrbitBaseUrl(resolved.url ?? "");
		if (!validatedUrl.ok) throw new Error(`Invalid URL: ${validatedUrl.error}`);
		let allowPrivateNetwork = resolved.allowPrivateNetwork ?? false;
		if (isBlockedUrbitHostname(validatedUrl.hostname)) {
			allowPrivateNetwork = await prompter.confirm({
				message: "Ship URL looks like a private/internal host. Allow private network access? (SSRF risk)",
				initialValue: allowPrivateNetwork
			});
			if (!allowPrivateNetwork) throw new Error("Refusing private/internal Ship URL without explicit approval");
		}
		next = applyTlonSetupConfig({
			cfg: next,
			accountId,
			input: { allowPrivateNetwork }
		});
		const currentGroups = resolved.groupChannels;
		if (await prompter.confirm({
			message: "Add group channels manually? (optional)",
			initialValue: currentGroups.length > 0
		})) {
			const entry = await prompter.text({
				message: "Group channels (comma-separated)",
				placeholder: "chat/~host-ship/general, chat/~host-ship/support",
				initialValue: currentGroups.join(", ") || void 0
			});
			next = applyTlonSetupConfig({
				cfg: next,
				accountId,
				input: { groupChannels: parseList(String(entry ?? "")) }
			});
		}
		const currentAllowlist = resolved.dmAllowlist;
		if (await prompter.confirm({
			message: "Restrict DMs with an allowlist?",
			initialValue: currentAllowlist.length > 0
		})) {
			const entry = await prompter.text({
				message: "DM allowlist (comma-separated ship names)",
				placeholder: "~zod, ~nec",
				initialValue: currentAllowlist.join(", ") || void 0
			});
			next = applyTlonSetupConfig({
				cfg: next,
				accountId,
				input: { dmAllowlist: parseList(String(entry ?? "")).map((ship) => normalizeShip(ship)) }
			});
		}
		const autoDiscoverChannels = await prompter.confirm({
			message: "Enable auto-discovery of group channels?",
			initialValue: resolved.autoDiscoverChannels ?? true
		});
		next = applyTlonSetupConfig({
			cfg: next,
			accountId,
			input: { autoDiscoverChannels }
		});
		return { cfg: next };
	}
});
//#endregion
export { listTlonAccountIds as a, normalizeShip as c, resolveTlonOutboundTarget as d, validateUrbitBaseUrl as i, parseChannelNest as l, createTlonSetupWizardBase as n, resolveTlonAccount as o, tlonSetupAdapter as r, formatTargetHint as s, tlonSetupWizard as t, parseTlonTarget as u };
