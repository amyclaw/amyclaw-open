import { r as buildChannelConfigSchema } from "./config-schema-GQ6uWjXe.js";
import { a as listTlonAccountIds, d as resolveTlonOutboundTarget, n as createTlonSetupWizardBase, o as resolveTlonAccount, r as tlonSetupAdapter, s as formatTargetHint, u as parseTlonTarget } from "./tlon-CU4nsDG9.js";
import { z } from "zod";
//#region extensions/tlon/src/config-schema.ts
const ShipSchema = z.string().min(1);
const ChannelNestSchema = z.string().min(1);
const TlonChannelRuleSchema = z.object({
	mode: z.enum(["restricted", "open"]).optional(),
	allowedShips: z.array(ShipSchema).optional()
});
const TlonAuthorizationSchema = z.object({ channelRules: z.record(z.string(), TlonChannelRuleSchema).optional() });
const tlonCommonConfigFields = {
	name: z.string().optional(),
	enabled: z.boolean().optional(),
	ship: ShipSchema.optional(),
	url: z.string().optional(),
	code: z.string().optional(),
	allowPrivateNetwork: z.boolean().optional(),
	groupChannels: z.array(ChannelNestSchema).optional(),
	dmAllowlist: z.array(ShipSchema).optional(),
	autoDiscoverChannels: z.boolean().optional(),
	showModelSignature: z.boolean().optional(),
	responsePrefix: z.string().optional(),
	autoAcceptDmInvites: z.boolean().optional(),
	autoAcceptGroupInvites: z.boolean().optional(),
	ownerShip: ShipSchema.optional()
};
const TlonAccountSchema = z.object({ ...tlonCommonConfigFields });
const tlonChannelConfigSchema = buildChannelConfigSchema(z.object({
	...tlonCommonConfigFields,
	authorization: TlonAuthorizationSchema.optional(),
	defaultAuthorizedShips: z.array(ShipSchema).optional(),
	accounts: z.record(z.string(), TlonAccountSchema).optional()
}));
//#endregion
//#region extensions/tlon/src/channel.ts
const TLON_CHANNEL_ID = "tlon";
let tlonChannelRuntimePromise = null;
async function loadTlonChannelRuntime() {
	tlonChannelRuntimePromise ??= import("./channel.runtime-hVUBlS3R.js");
	return tlonChannelRuntimePromise;
}
const tlonSetupWizardProxy = createTlonSetupWizardBase({
	resolveConfigured: async ({ cfg }) => await (await loadTlonChannelRuntime()).tlonSetupWizard.status.resolveConfigured({ cfg }),
	resolveStatusLines: async ({ cfg, configured }) => await (await loadTlonChannelRuntime()).tlonSetupWizard.status.resolveStatusLines?.({
		cfg,
		configured
	}) ?? [],
	finalize: async (params) => await (await loadTlonChannelRuntime()).tlonSetupWizard.finalize(params)
});
const tlonPlugin = {
	id: TLON_CHANNEL_ID,
	meta: {
		id: TLON_CHANNEL_ID,
		label: "Tlon",
		selectionLabel: "Tlon (Urbit)",
		docsPath: "/channels/tlon",
		docsLabel: "tlon",
		blurb: "Decentralized messaging on Urbit",
		aliases: ["urbit"],
		order: 90
	},
	capabilities: {
		chatTypes: [
			"direct",
			"group",
			"thread"
		],
		media: true,
		reply: true,
		threads: true
	},
	setup: tlonSetupAdapter,
	setupWizard: tlonSetupWizardProxy,
	reload: { configPrefixes: ["channels.tlon"] },
	configSchema: tlonChannelConfigSchema,
	config: {
		listAccountIds: (cfg) => listTlonAccountIds(cfg),
		resolveAccount: (cfg, accountId) => resolveTlonAccount(cfg, accountId ?? void 0),
		defaultAccountId: () => "default",
		setAccountEnabled: ({ cfg, accountId, enabled }) => {
			if (!accountId || accountId === "default") return {
				...cfg,
				channels: {
					...cfg.channels,
					tlon: {
						...cfg.channels?.tlon,
						enabled
					}
				}
			};
			return {
				...cfg,
				channels: {
					...cfg.channels,
					tlon: {
						...cfg.channels?.tlon,
						accounts: {
							...cfg.channels?.tlon?.accounts,
							[accountId]: {
								...cfg.channels?.tlon?.accounts?.[accountId],
								enabled
							}
						}
					}
				}
			};
		},
		deleteAccount: ({ cfg, accountId }) => {
			if (!accountId || accountId === "default") {
				const { ship: _ship, code: _code, url: _url, name: _name, ...rest } = cfg.channels?.tlon ?? {};
				return {
					...cfg,
					channels: {
						...cfg.channels,
						tlon: rest
					}
				};
			}
			const { [accountId]: _removed, ...remainingAccounts } = cfg.channels?.tlon?.accounts ?? {};
			return {
				...cfg,
				channels: {
					...cfg.channels,
					tlon: {
						...cfg.channels?.tlon,
						accounts: remainingAccounts
					}
				}
			};
		},
		isConfigured: (account) => account.configured,
		describeAccount: (account) => ({
			accountId: account.accountId,
			name: account.name,
			enabled: account.enabled,
			configured: account.configured,
			ship: account.ship,
			url: account.url
		})
	},
	messaging: {
		normalizeTarget: (target) => {
			const parsed = parseTlonTarget(target);
			if (!parsed) return target.trim();
			if (parsed.kind === "dm") return parsed.ship;
			return parsed.nest;
		},
		targetResolver: {
			looksLikeId: (target) => Boolean(parseTlonTarget(target)),
			hint: formatTargetHint()
		}
	},
	outbound: {
		deliveryMode: "direct",
		textChunkLimit: 1e4,
		resolveTarget: ({ to }) => resolveTlonOutboundTarget(to),
		sendText: async (params) => await (await loadTlonChannelRuntime()).tlonRuntimeOutbound.sendText(params),
		sendMedia: async (params) => await (await loadTlonChannelRuntime()).tlonRuntimeOutbound.sendMedia(params)
	},
	status: {
		defaultRuntime: {
			accountId: "default",
			running: false,
			lastStartAt: null,
			lastStopAt: null,
			lastError: null
		},
		collectStatusIssues: (accounts) => {
			return accounts.flatMap((account) => {
				if (!account.configured) return [{
					channel: TLON_CHANNEL_ID,
					accountId: account.accountId,
					kind: "config",
					message: "Account not configured (missing ship, code, or url)"
				}];
				return [];
			});
		},
		buildChannelSummary: ({ snapshot }) => {
			const s = snapshot;
			return {
				configured: s.configured ?? false,
				ship: s.ship ?? null,
				url: s.url ?? null
			};
		},
		probeAccount: async ({ account }) => {
			if (!account.configured || !account.ship || !account.url || !account.code) return {
				ok: false,
				error: "Not configured"
			};
			return await (await loadTlonChannelRuntime()).probeTlonAccount(account);
		},
		buildAccountSnapshot: ({ account, runtime, probe }) => {
			return {
				accountId: account.accountId,
				name: account.name,
				enabled: account.enabled,
				configured: account.configured,
				ship: account.ship,
				url: account.url,
				running: runtime?.running ?? false,
				lastStartAt: runtime?.lastStartAt ?? null,
				lastStopAt: runtime?.lastStopAt ?? null,
				lastError: runtime?.lastError ?? null,
				probe
			};
		}
	},
	gateway: { startAccount: async (ctx) => await (await loadTlonChannelRuntime()).startTlonGatewayAccount(ctx) }
};
//#endregion
export { tlonPlugin as t };
