import { m as normalizeE164 } from "./utils-BMtC0Ocd.js";
import { BT as collectOpenGroupPolicyRouteAllowlistWarnings, Dr as resolveWhatsAppGroupToolPolicy, Er as resolveWhatsAppGroupRequireMention, IT as collectAllowlistProviderGroupPolicyWarnings, bT as resolveWhatsAppConfigAllowFrom, cr as resolveDefaultWhatsAppAccountId, hT as formatWhatsAppConfigAllowFromEntries, kT as buildAccountScopedDmSecurityPolicy, lr as resolveWhatsAppAccount, pr as resolveWhatsAppGroupIntroHint, sr as listWhatsAppAccountIds, xT as resolveWhatsAppConfigDefaultTo } from "./auth-profiles-Bc6TPi0n.js";
import "./account-id-O4Og6DrK.js";
import { S as WhatsAppConfigSchema } from "./io-CezuVcrG.js";
import { r as getChatChannelMeta } from "./registry-jBzBWMf6.js";
import { r as buildChannelConfigSchema } from "./config-schema-GQ6uWjXe.js";
//#region extensions/whatsapp/src/shared.ts
const WHATSAPP_CHANNEL = "whatsapp";
async function loadWhatsAppChannelRuntime() {
	return await import("./channel.runtime-PJ4yXt6w.js");
}
const whatsappSetupWizardProxy = createWhatsAppSetupWizardProxy(async () => ({ whatsappSetupWizard: (await loadWhatsAppChannelRuntime()).whatsappSetupWizard }));
function createWhatsAppSetupWizardProxy(loadWizard) {
	return {
		channel: WHATSAPP_CHANNEL,
		status: {
			configuredLabel: "linked",
			unconfiguredLabel: "not linked",
			configuredHint: "linked",
			unconfiguredHint: "not linked",
			configuredScore: 5,
			unconfiguredScore: 4,
			resolveConfigured: async ({ cfg }) => await (await loadWizard()).whatsappSetupWizard.status.resolveConfigured({ cfg }),
			resolveStatusLines: async ({ cfg, configured }) => await (await loadWizard()).whatsappSetupWizard.status.resolveStatusLines?.({
				cfg,
				configured
			}) ?? []
		},
		resolveShouldPromptAccountIds: (params) => (params.shouldPromptAccountIds || params.options?.promptWhatsAppAccountId) ?? false,
		credentials: [],
		finalize: async (params) => await (await loadWizard()).whatsappSetupWizard.finalize(params),
		disable: (cfg) => ({
			...cfg,
			channels: {
				...cfg.channels,
				whatsapp: {
					...cfg.channels?.whatsapp,
					enabled: false
				}
			}
		}),
		onAccountRecorded: (accountId, options) => {
			options?.onWhatsAppAccountId?.(accountId);
		}
	};
}
function createWhatsAppPluginBase(params) {
	return {
		id: WHATSAPP_CHANNEL,
		meta: {
			...getChatChannelMeta(WHATSAPP_CHANNEL),
			showConfigured: false,
			quickstartAllowFrom: true,
			forceAccountBinding: true,
			preferSessionLookupForAnnounceTarget: true
		},
		setupWizard: params.setupWizard,
		capabilities: {
			chatTypes: ["direct", "group"],
			polls: true,
			reactions: true,
			media: true
		},
		reload: {
			configPrefixes: ["web"],
			noopPrefixes: ["channels.whatsapp"]
		},
		gatewayMethods: ["web.login.start", "web.login.wait"],
		configSchema: buildChannelConfigSchema(WhatsAppConfigSchema),
		config: {
			listAccountIds: (cfg) => listWhatsAppAccountIds(cfg),
			resolveAccount: (cfg, accountId) => resolveWhatsAppAccount({
				cfg,
				accountId
			}),
			defaultAccountId: (cfg) => resolveDefaultWhatsAppAccountId(cfg),
			setAccountEnabled: ({ cfg, accountId, enabled }) => {
				const accountKey = accountId || "default";
				const accounts = { ...cfg.channels?.whatsapp?.accounts };
				const existing = accounts[accountKey] ?? {};
				return {
					...cfg,
					channels: {
						...cfg.channels,
						whatsapp: {
							...cfg.channels?.whatsapp,
							accounts: {
								...accounts,
								[accountKey]: {
									...existing,
									enabled
								}
							}
						}
					}
				};
			},
			deleteAccount: ({ cfg, accountId }) => {
				const accountKey = accountId || "default";
				const accounts = { ...cfg.channels?.whatsapp?.accounts };
				delete accounts[accountKey];
				return {
					...cfg,
					channels: {
						...cfg.channels,
						whatsapp: {
							...cfg.channels?.whatsapp,
							accounts: Object.keys(accounts).length ? accounts : void 0
						}
					}
				};
			},
			isEnabled: (account, cfg) => account.enabled && cfg.web?.enabled !== false,
			disabledReason: () => "disabled",
			isConfigured: params.isConfigured,
			unconfiguredReason: () => "not linked",
			describeAccount: (account) => ({
				accountId: account.accountId,
				name: account.name,
				enabled: account.enabled,
				configured: Boolean(account.authDir),
				linked: Boolean(account.authDir),
				dmPolicy: account.dmPolicy,
				allowFrom: account.allowFrom
			}),
			resolveAllowFrom: ({ cfg, accountId }) => resolveWhatsAppConfigAllowFrom({
				cfg,
				accountId
			}),
			formatAllowFrom: ({ allowFrom }) => formatWhatsAppConfigAllowFromEntries(allowFrom),
			resolveDefaultTo: ({ cfg, accountId }) => resolveWhatsAppConfigDefaultTo({
				cfg,
				accountId
			})
		},
		security: {
			resolveDmPolicy: ({ cfg, accountId, account }) => buildAccountScopedDmSecurityPolicy({
				cfg,
				channelKey: WHATSAPP_CHANNEL,
				accountId,
				fallbackAccountId: account.accountId ?? "default",
				policy: account.dmPolicy,
				allowFrom: account.allowFrom ?? [],
				policyPathSuffix: "dmPolicy",
				normalizeEntry: (raw) => normalizeE164(raw)
			}),
			collectWarnings: ({ account, cfg }) => {
				const groupAllowlistConfigured = Boolean(account.groups) && Object.keys(account.groups ?? {}).length > 0;
				return collectAllowlistProviderGroupPolicyWarnings({
					cfg,
					providerConfigPresent: cfg.channels?.whatsapp !== void 0,
					configuredGroupPolicy: account.groupPolicy,
					collect: (groupPolicy) => collectOpenGroupPolicyRouteAllowlistWarnings({
						groupPolicy,
						routeAllowlistConfigured: groupAllowlistConfigured,
						restrictSenders: {
							surface: "WhatsApp groups",
							openScope: "any member in allowed groups",
							groupPolicyPath: "channels.whatsapp.groupPolicy",
							groupAllowFromPath: "channels.whatsapp.groupAllowFrom"
						},
						noRouteAllowlist: {
							surface: "WhatsApp groups",
							routeAllowlistPath: "channels.whatsapp.groups",
							routeScope: "group",
							groupPolicyPath: "channels.whatsapp.groupPolicy",
							groupAllowFromPath: "channels.whatsapp.groupAllowFrom"
						}
					})
				});
			}
		},
		setup: params.setup,
		groups: {
			resolveRequireMention: resolveWhatsAppGroupRequireMention,
			resolveToolPolicy: resolveWhatsAppGroupToolPolicy,
			resolveGroupIntroHint: resolveWhatsAppGroupIntroHint
		}
	};
}
//#endregion
export { whatsappSetupWizardProxy as i, createWhatsAppPluginBase as n, loadWhatsAppChannelRuntime as r, WHATSAPP_CHANNEL as t };
