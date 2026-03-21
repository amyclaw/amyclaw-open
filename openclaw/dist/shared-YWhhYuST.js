import { m as normalizeE164 } from "./utils-BMtC0Ocd.js";
import { Bx as listSignalAccountIds, Hx as resolveSignalAccount, LT as collectAllowlistProviderRestrictSendersWarnings, UT as deleteAccountFromConfigSection, Vx as resolveDefaultSignalAccountId, WT as setAccountEnabledInConfigSection, dT as createScopedAccountConfigAccessors, kT as buildAccountScopedDmSecurityPolicy } from "./auth-profiles-Bc6TPi0n.js";
import "./account-id-O4Og6DrK.js";
import { D as SignalConfigSchema } from "./io-CezuVcrG.js";
import { r as getChatChannelMeta } from "./registry-jBzBWMf6.js";
import { r as buildChannelConfigSchema } from "./config-schema-GQ6uWjXe.js";
import { n as createSignalSetupWizardProxy } from "./setup-core-D95RE7dL.js";
//#region extensions/signal/src/shared.ts
const SIGNAL_CHANNEL = "signal";
async function loadSignalChannelRuntime() {
	return await import("./channel.runtime-CTgwQOxc.js");
}
const signalSetupWizard = createSignalSetupWizardProxy(async () => ({ signalSetupWizard: (await loadSignalChannelRuntime()).signalSetupWizard }));
const signalConfigAccessors = createScopedAccountConfigAccessors({
	resolveAccount: ({ cfg, accountId }) => resolveSignalAccount({
		cfg,
		accountId
	}),
	resolveAllowFrom: (account) => account.config.allowFrom,
	formatAllowFrom: (allowFrom) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => entry === "*" ? "*" : normalizeE164(entry.replace(/^signal:/i, ""))).filter(Boolean),
	resolveDefaultTo: (account) => account.config.defaultTo
});
function createSignalPluginBase(params) {
	return {
		id: SIGNAL_CHANNEL,
		meta: { ...getChatChannelMeta(SIGNAL_CHANNEL) },
		setupWizard: params.setupWizard,
		capabilities: {
			chatTypes: ["direct", "group"],
			media: true,
			reactions: true
		},
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		reload: { configPrefixes: ["channels.signal"] },
		configSchema: buildChannelConfigSchema(SignalConfigSchema),
		config: {
			listAccountIds: (cfg) => listSignalAccountIds(cfg),
			resolveAccount: (cfg, accountId) => resolveSignalAccount({
				cfg,
				accountId
			}),
			defaultAccountId: (cfg) => resolveDefaultSignalAccountId(cfg),
			setAccountEnabled: ({ cfg, accountId, enabled }) => setAccountEnabledInConfigSection({
				cfg,
				sectionKey: SIGNAL_CHANNEL,
				accountId,
				enabled,
				allowTopLevel: true
			}),
			deleteAccount: ({ cfg, accountId }) => deleteAccountFromConfigSection({
				cfg,
				sectionKey: SIGNAL_CHANNEL,
				accountId,
				clearBaseFields: [
					"account",
					"httpUrl",
					"httpHost",
					"httpPort",
					"cliPath",
					"name"
				]
			}),
			isConfigured: (account) => account.configured,
			describeAccount: (account) => ({
				accountId: account.accountId,
				name: account.name,
				enabled: account.enabled,
				configured: account.configured,
				baseUrl: account.baseUrl
			}),
			...signalConfigAccessors
		},
		security: {
			resolveDmPolicy: ({ cfg, accountId, account }) => buildAccountScopedDmSecurityPolicy({
				cfg,
				channelKey: SIGNAL_CHANNEL,
				accountId,
				fallbackAccountId: account.accountId ?? "default",
				policy: account.config.dmPolicy,
				allowFrom: account.config.allowFrom ?? [],
				policyPathSuffix: "dmPolicy",
				normalizeEntry: (raw) => normalizeE164(raw.replace(/^signal:/i, "").trim())
			}),
			collectWarnings: ({ account, cfg }) => collectAllowlistProviderRestrictSendersWarnings({
				cfg,
				providerConfigPresent: cfg.channels?.signal !== void 0,
				configuredGroupPolicy: account.config.groupPolicy,
				surface: "Signal groups",
				openScope: "any member",
				groupPolicyPath: "channels.signal.groupPolicy",
				groupAllowFromPath: "channels.signal.groupAllowFrom",
				mentionGated: false
			})
		},
		setup: params.setup
	};
}
//#endregion
export { signalConfigAccessors as n, signalSetupWizard as r, createSignalPluginBase as t };
