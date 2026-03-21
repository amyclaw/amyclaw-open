import { Jo as resolveIMessageAccount, Ko as listIMessageAccountIds, LT as collectAllowlistProviderRestrictSendersWarnings, UT as deleteAccountFromConfigSection, WT as setAccountEnabledInConfigSection, _T as resolveIMessageConfigAllowFrom, kT as buildAccountScopedDmSecurityPolicy, mT as formatTrimmedAllowFromEntries, qo as resolveDefaultIMessageAccountId, vT as resolveIMessageConfigDefaultTo } from "./auth-profiles-Bc6TPi0n.js";
import "./account-id-O4Og6DrK.js";
import { T as IMessageConfigSchema } from "./io-CezuVcrG.js";
import { r as getChatChannelMeta } from "./registry-jBzBWMf6.js";
import { r as buildChannelConfigSchema } from "./config-schema-GQ6uWjXe.js";
import { n as createIMessageSetupWizardProxy } from "./setup-core-FmBcvIJS.js";
//#region extensions/imessage/src/shared.ts
const IMESSAGE_CHANNEL = "imessage";
async function loadIMessageChannelRuntime() {
	return await import("./channel.runtime-CFxVEn1j.js");
}
const imessageSetupWizard = createIMessageSetupWizardProxy(async () => ({ imessageSetupWizard: (await loadIMessageChannelRuntime()).imessageSetupWizard }));
function createIMessagePluginBase(params) {
	return {
		id: IMESSAGE_CHANNEL,
		meta: {
			...getChatChannelMeta(IMESSAGE_CHANNEL),
			aliases: ["imsg"],
			showConfigured: false
		},
		setupWizard: params.setupWizard,
		capabilities: {
			chatTypes: ["direct", "group"],
			media: true
		},
		reload: { configPrefixes: ["channels.imessage"] },
		configSchema: buildChannelConfigSchema(IMessageConfigSchema),
		config: {
			listAccountIds: (cfg) => listIMessageAccountIds(cfg),
			resolveAccount: (cfg, accountId) => resolveIMessageAccount({
				cfg,
				accountId
			}),
			defaultAccountId: (cfg) => resolveDefaultIMessageAccountId(cfg),
			setAccountEnabled: ({ cfg, accountId, enabled }) => setAccountEnabledInConfigSection({
				cfg,
				sectionKey: IMESSAGE_CHANNEL,
				accountId,
				enabled,
				allowTopLevel: true
			}),
			deleteAccount: ({ cfg, accountId }) => deleteAccountFromConfigSection({
				cfg,
				sectionKey: IMESSAGE_CHANNEL,
				accountId,
				clearBaseFields: [
					"cliPath",
					"dbPath",
					"service",
					"region",
					"name"
				]
			}),
			isConfigured: (account) => account.configured,
			describeAccount: (account) => ({
				accountId: account.accountId,
				name: account.name,
				enabled: account.enabled,
				configured: account.configured
			}),
			resolveAllowFrom: ({ cfg, accountId }) => resolveIMessageConfigAllowFrom({
				cfg,
				accountId
			}),
			formatAllowFrom: ({ allowFrom }) => formatTrimmedAllowFromEntries(allowFrom),
			resolveDefaultTo: ({ cfg, accountId }) => resolveIMessageConfigDefaultTo({
				cfg,
				accountId
			})
		},
		security: {
			resolveDmPolicy: ({ cfg, accountId, account }) => buildAccountScopedDmSecurityPolicy({
				cfg,
				channelKey: IMESSAGE_CHANNEL,
				accountId,
				fallbackAccountId: account.accountId ?? "default",
				policy: account.config.dmPolicy,
				allowFrom: account.config.allowFrom ?? [],
				policyPathSuffix: "dmPolicy"
			}),
			collectWarnings: ({ account, cfg }) => collectAllowlistProviderRestrictSendersWarnings({
				cfg,
				providerConfigPresent: cfg.channels?.imessage !== void 0,
				configuredGroupPolicy: account.config.groupPolicy,
				surface: "iMessage groups",
				openScope: "any member",
				groupPolicyPath: "channels.imessage.groupPolicy",
				groupAllowFromPath: "channels.imessage.groupAllowFrom",
				mentionGated: false
			})
		},
		setup: params.setup
	};
}
//#endregion
export { imessageSetupWizard as n, createIMessagePluginBase as t };
