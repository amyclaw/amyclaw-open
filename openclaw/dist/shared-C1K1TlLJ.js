import { XS as resolveDefaultDiscordAccountId, YS as listDiscordAccountIds, ZS as resolveDiscordAccount, dT as createScopedAccountConfigAccessors, fT as createScopedChannelConfigBase, mb as inspectDiscordAccount } from "./auth-profiles-Bc6TPi0n.js";
import { C as DiscordConfigSchema } from "./io-CezuVcrG.js";
import { r as getChatChannelMeta } from "./registry-jBzBWMf6.js";
import { r as buildChannelConfigSchema } from "./config-schema-GQ6uWjXe.js";
import { t as formatAllowFromLowercase } from "./allow-from-CRBQe4aU.js";
import { n as createDiscordSetupWizardProxy } from "./setup-core-DwZ_G2We.js";
//#region extensions/discord/src/shared.ts
const DISCORD_CHANNEL = "discord";
async function loadDiscordChannelRuntime() {
	return await import("./channel.runtime-Ddta66pO.js");
}
const discordSetupWizard = createDiscordSetupWizardProxy(async () => ({ discordSetupWizard: (await loadDiscordChannelRuntime()).discordSetupWizard }));
const discordConfigAccessors = createScopedAccountConfigAccessors({
	resolveAccount: ({ cfg, accountId }) => resolveDiscordAccount({
		cfg,
		accountId
	}),
	resolveAllowFrom: (account) => account.config.dm?.allowFrom,
	formatAllowFrom: (allowFrom) => formatAllowFromLowercase({ allowFrom }),
	resolveDefaultTo: (account) => account.config.defaultTo
});
const discordConfigBase = createScopedChannelConfigBase({
	sectionKey: DISCORD_CHANNEL,
	listAccountIds: listDiscordAccountIds,
	resolveAccount: (cfg, accountId) => resolveDiscordAccount({
		cfg,
		accountId
	}),
	inspectAccount: (cfg, accountId) => inspectDiscordAccount({
		cfg,
		accountId
	}),
	defaultAccountId: resolveDefaultDiscordAccountId,
	clearBaseFields: ["token", "name"]
});
function createDiscordPluginBase(params) {
	return {
		id: DISCORD_CHANNEL,
		meta: { ...getChatChannelMeta(DISCORD_CHANNEL) },
		setupWizard: discordSetupWizard,
		capabilities: {
			chatTypes: [
				"direct",
				"channel",
				"thread"
			],
			polls: true,
			reactions: true,
			threads: true,
			media: true,
			nativeCommands: true
		},
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		reload: { configPrefixes: ["channels.discord"] },
		configSchema: buildChannelConfigSchema(DiscordConfigSchema),
		config: {
			...discordConfigBase,
			isConfigured: (account) => Boolean(account.token?.trim()),
			describeAccount: (account) => ({
				accountId: account.accountId,
				name: account.name,
				enabled: account.enabled,
				configured: Boolean(account.token?.trim()),
				tokenSource: account.tokenSource
			}),
			...discordConfigAccessors
		},
		setup: params.setup
	};
}
//#endregion
export { discordConfigAccessors as n, createDiscordPluginBase as t };
