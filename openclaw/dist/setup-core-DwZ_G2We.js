import { t as formatDocsLink } from "./links-DA9sitJV.js";
import { Dg as setLegacyChannelDmPolicyWithAllowFrom, Dw as createEnvPatchedAccountSetupAdapter, Gh as createAllowlistSetupWizardProxy, Og as setSetupChannelEnabled, YS as listDiscordAccountIds, ZS as resolveDiscordAccount, _g as patchChannelConfigForAccount, fg as noteChannelLookupFailure, mb as inspectDiscordAccount, mg as parseMentionOrPrefixedId, pg as noteChannelLookupSummary } from "./auth-profiles-Bc6TPi0n.js";
import { t as DEFAULT_ACCOUNT_ID } from "./account-id-O4Og6DrK.js";
//#region extensions/discord/src/setup-core.ts
const channel = "discord";
const DISCORD_TOKEN_HELP_LINES = [
	"1) Discord Developer Portal -> Applications -> New Application",
	"2) Bot -> Add Bot -> Reset Token -> copy token",
	"3) OAuth2 -> URL Generator -> scope 'bot' -> invite to your server",
	"Tip: enable Message Content Intent if you need message text. (Bot -> Privileged Gateway Intents -> Message Content Intent)",
	`Docs: ${formatDocsLink("/discord", "discord")}`
];
function setDiscordGuildChannelAllowlist(cfg, accountId, entries) {
	const guilds = { ...accountId === "default" ? cfg.channels?.discord?.guilds ?? {} : cfg.channels?.discord?.accounts?.[accountId]?.guilds ?? {} };
	for (const entry of entries) {
		const guildKey = entry.guildKey || "*";
		const existing = guilds[guildKey] ?? {};
		if (entry.channelKey) {
			const channels = { ...existing.channels };
			channels[entry.channelKey] = { allow: true };
			guilds[guildKey] = {
				...existing,
				channels
			};
		} else guilds[guildKey] = existing;
	}
	return patchChannelConfigForAccount({
		cfg,
		channel,
		accountId,
		patch: { guilds }
	});
}
function parseDiscordAllowFromId(value) {
	return parseMentionOrPrefixedId({
		value,
		mentionPattern: /^<@!?(\d+)>$/,
		prefixPattern: /^(user:|discord:)/i,
		idPattern: /^\d+$/
	});
}
const discordSetupAdapter = createEnvPatchedAccountSetupAdapter({
	channelKey: channel,
	defaultAccountOnlyEnvError: "DISCORD_BOT_TOKEN can only be used for the default account.",
	missingCredentialError: "Discord requires token (or --use-env).",
	hasCredentials: (input) => Boolean(input.token),
	buildPatch: (input) => input.token ? { token: input.token } : {}
});
function createDiscordSetupWizardBase(handlers) {
	const discordDmPolicy = {
		label: "Discord",
		channel,
		policyKey: "channels.discord.dmPolicy",
		allowFromKey: "channels.discord.allowFrom",
		getCurrent: (cfg) => cfg.channels?.discord?.dmPolicy ?? cfg.channels?.discord?.dm?.policy ?? "pairing",
		setPolicy: (cfg, policy) => setLegacyChannelDmPolicyWithAllowFrom({
			cfg,
			channel,
			dmPolicy: policy
		}),
		promptAllowFrom: handlers.promptAllowFrom
	};
	return {
		channel,
		status: {
			configuredLabel: "configured",
			unconfiguredLabel: "needs token",
			configuredHint: "configured",
			unconfiguredHint: "needs token",
			configuredScore: 2,
			unconfiguredScore: 1,
			resolveConfigured: ({ cfg }) => listDiscordAccountIds(cfg).some((accountId) => {
				return inspectDiscordAccount({
					cfg,
					accountId
				}).configured;
			})
		},
		credentials: [{
			inputKey: "token",
			providerHint: channel,
			credentialLabel: "Discord bot token",
			preferredEnvVar: "DISCORD_BOT_TOKEN",
			helpTitle: "Discord bot token",
			helpLines: DISCORD_TOKEN_HELP_LINES,
			envPrompt: "DISCORD_BOT_TOKEN detected. Use env var?",
			keepPrompt: "Discord token already configured. Keep it?",
			inputPrompt: "Enter Discord bot token",
			allowEnv: ({ accountId }) => accountId === DEFAULT_ACCOUNT_ID,
			inspect: ({ cfg, accountId }) => {
				const account = inspectDiscordAccount({
					cfg,
					accountId
				});
				return {
					accountConfigured: account.configured,
					hasConfiguredValue: account.tokenStatus !== "missing",
					resolvedValue: account.token?.trim() || void 0,
					envValue: accountId === "default" ? process.env.DISCORD_BOT_TOKEN?.trim() || void 0 : void 0
				};
			}
		}],
		groupAccess: {
			label: "Discord channels",
			placeholder: "My Server/#general, guildId/channelId, #support",
			currentPolicy: ({ cfg, accountId }) => resolveDiscordAccount({
				cfg,
				accountId
			}).config.groupPolicy ?? "allowlist",
			currentEntries: ({ cfg, accountId }) => Object.entries(resolveDiscordAccount({
				cfg,
				accountId
			}).config.guilds ?? {}).flatMap(([guildKey, value]) => {
				const channels = value?.channels ?? {};
				const channelKeys = Object.keys(channels);
				if (channelKeys.length === 0) return [/^\d+$/.test(guildKey) ? `guild:${guildKey}` : guildKey];
				return channelKeys.map((channelKey) => `${guildKey}/${channelKey}`);
			}),
			updatePrompt: ({ cfg, accountId }) => Boolean(resolveDiscordAccount({
				cfg,
				accountId
			}).config.guilds),
			setPolicy: ({ cfg, accountId, policy }) => patchChannelConfigForAccount({
				cfg,
				channel,
				accountId,
				patch: { groupPolicy: policy }
			}),
			resolveAllowlist: async ({ cfg, accountId, credentialValues, entries, prompter }) => {
				try {
					return await handlers.resolveGroupAllowlist({
						cfg,
						accountId,
						credentialValues,
						entries,
						prompter
					});
				} catch (error) {
					await noteChannelLookupFailure({
						prompter,
						label: "Discord channels",
						error
					});
					await noteChannelLookupSummary({
						prompter,
						label: "Discord channels",
						resolvedSections: [],
						unresolved: entries
					});
					return entries.map((input) => ({
						input,
						resolved: false
					}));
				}
			},
			applyAllowlist: ({ cfg, accountId, resolved }) => setDiscordGuildChannelAllowlist(cfg, accountId, resolved)
		},
		allowFrom: {
			credentialInputKey: "token",
			helpTitle: "Discord allowlist",
			helpLines: [
				"Allowlist Discord DMs by username (we resolve to user ids).",
				"Examples:",
				"- 123456789012345678",
				"- @alice",
				"- alice#1234",
				"Multiple entries: comma-separated.",
				`Docs: ${formatDocsLink("/discord", "discord")}`
			],
			message: "Discord allowFrom (usernames or ids)",
			placeholder: "@alice, 123456789012345678",
			invalidWithoutCredentialNote: "Bot token missing; use numeric user ids (or mention form) only.",
			parseId: parseDiscordAllowFromId,
			resolveEntries: async ({ cfg, accountId, credentialValues, entries }) => await handlers.resolveAllowFromEntries({
				cfg,
				accountId,
				credentialValues,
				entries
			}),
			apply: async ({ cfg, accountId, allowFrom }) => patchChannelConfigForAccount({
				cfg,
				channel,
				accountId,
				patch: {
					dmPolicy: "allowlist",
					allowFrom
				}
			})
		},
		dmPolicy: discordDmPolicy,
		disable: (cfg) => setSetupChannelEnabled(cfg, channel, false)
	};
}
function createDiscordSetupWizardProxy(loadWizard) {
	return createAllowlistSetupWizardProxy({
		loadWizard: async () => (await loadWizard()).discordSetupWizard,
		createBase: createDiscordSetupWizardBase,
		fallbackResolvedGroupAllowlist: (entries) => entries.map((input) => ({
			input,
			resolved: false
		}))
	});
}
//#endregion
export { parseDiscordAllowFromId as i, createDiscordSetupWizardProxy as n, discordSetupAdapter as r, createDiscordSetupWizardBase as t };
