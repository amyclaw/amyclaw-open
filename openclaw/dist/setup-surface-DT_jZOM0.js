import { t as formatDocsLink } from "./links-DA9sitJV.js";
import { Cg as resolveSetupAccountId, Dg as setLegacyChannelDmPolicyWithAllowFrom, Dw as createEnvPatchedAccountSetupAdapter, Mx as resolveDefaultSlackAccountId, Nx as resolveSlackAccount, Og as setSetupChannelEnabled, Ox as inspectSlackAccount, Tg as setAccountGroupPolicyForChannel, _g as patchChannelConfigForAccount, dT as createScopedAccountConfigAccessors, fT as createScopedChannelConfigBase, fg as noteChannelLookupFailure, jx as listSlackAccountIds, kx as isSlackInteractiveRepliesEnabled, mg as parseMentionOrPrefixedId, pg as noteChannelLookupSummary, vg as promptLegacyChannelAllowFrom } from "./auth-profiles-Bc6TPi0n.js";
import { t as DEFAULT_ACCOUNT_ID } from "./account-id-O4Og6DrK.js";
import { O as SlackConfigSchema } from "./io-CezuVcrG.js";
import { a as hasConfiguredSecretInput } from "./types.secrets-DuSPmmWB.js";
import { r as getChatChannelMeta } from "./registry-jBzBWMf6.js";
import { r as buildChannelConfigSchema } from "./config-schema-GQ6uWjXe.js";
import { t as formatAllowFromLowercase } from "./allow-from-CRBQe4aU.js";
import { n as resolveSlackUserAllowlist, t as resolveSlackChannelAllowlist } from "./resolve-channels-faZ2F1NK.js";
//#region extensions/slack/src/shared.ts
const SLACK_CHANNEL = "slack";
function buildSlackManifest(botName) {
	const safeName = botName.trim() || "OpenClaw";
	const manifest = {
		display_information: {
			name: safeName,
			description: `${safeName} connector for OpenClaw`
		},
		features: {
			bot_user: {
				display_name: safeName,
				always_online: false
			},
			app_home: {
				messages_tab_enabled: true,
				messages_tab_read_only_enabled: false
			},
			slash_commands: [{
				command: "/openclaw",
				description: "Send a message to OpenClaw",
				should_escape: false
			}]
		},
		oauth_config: { scopes: { bot: [
			"chat:write",
			"channels:history",
			"channels:read",
			"groups:history",
			"im:history",
			"mpim:history",
			"users:read",
			"app_mentions:read",
			"reactions:read",
			"reactions:write",
			"pins:read",
			"pins:write",
			"emoji:read",
			"commands",
			"files:read",
			"files:write"
		] } },
		settings: {
			socket_mode_enabled: true,
			event_subscriptions: { bot_events: [
				"app_mention",
				"message.channels",
				"message.groups",
				"message.im",
				"message.mpim",
				"reaction_added",
				"reaction_removed",
				"member_joined_channel",
				"member_left_channel",
				"channel_rename",
				"pin_added",
				"pin_removed"
			] }
		}
	};
	return JSON.stringify(manifest, null, 2);
}
function buildSlackSetupLines(botName = "OpenClaw") {
	return [
		"1) Slack API -> Create App -> From scratch or From manifest (with the JSON below)",
		"2) Add Socket Mode + enable it to get the app-level token (xapp-...)",
		"3) Install App to workspace to get the xoxb- bot token",
		"4) Enable Event Subscriptions (socket) for message events",
		"5) App Home -> enable the Messages tab for DMs",
		"Tip: set SLACK_BOT_TOKEN + SLACK_APP_TOKEN in your env.",
		`Docs: ${formatDocsLink("/slack", "slack")}`,
		"",
		"Manifest (JSON):",
		buildSlackManifest(botName)
	];
}
function setSlackChannelAllowlist(cfg, accountId, channelKeys) {
	return patchChannelConfigForAccount({
		cfg,
		channel: SLACK_CHANNEL,
		accountId,
		patch: { channels: Object.fromEntries(channelKeys.map((key) => [key, { allow: true }])) }
	});
}
function isSlackPluginAccountConfigured(account) {
	const mode = account.config.mode ?? "socket";
	if (!Boolean(account.botToken?.trim())) return false;
	if (mode === "http") return Boolean(account.config.signingSecret?.trim());
	return Boolean(account.appToken?.trim());
}
function isSlackSetupAccountConfigured(account) {
	const hasConfiguredBotToken = Boolean(account.botToken?.trim()) || hasConfiguredSecretInput(account.config.botToken);
	const hasConfiguredAppToken = Boolean(account.appToken?.trim()) || hasConfiguredSecretInput(account.config.appToken);
	return hasConfiguredBotToken && hasConfiguredAppToken;
}
const slackConfigAccessors = createScopedAccountConfigAccessors({
	resolveAccount: ({ cfg, accountId }) => resolveSlackAccount({
		cfg,
		accountId
	}),
	resolveAllowFrom: (account) => account.dm?.allowFrom,
	formatAllowFrom: (allowFrom) => formatAllowFromLowercase({ allowFrom }),
	resolveDefaultTo: (account) => account.config.defaultTo
});
const slackConfigBase = createScopedChannelConfigBase({
	sectionKey: SLACK_CHANNEL,
	listAccountIds: listSlackAccountIds,
	resolveAccount: (cfg, accountId) => resolveSlackAccount({
		cfg,
		accountId
	}),
	inspectAccount: (cfg, accountId) => inspectSlackAccount({
		cfg,
		accountId
	}),
	defaultAccountId: resolveDefaultSlackAccountId,
	clearBaseFields: [
		"botToken",
		"appToken",
		"name"
	]
});
function createSlackPluginBase(params) {
	return {
		id: SLACK_CHANNEL,
		meta: {
			...getChatChannelMeta(SLACK_CHANNEL),
			preferSessionLookupForAnnounceTarget: true
		},
		setupWizard: params.setupWizard,
		capabilities: {
			chatTypes: [
				"direct",
				"channel",
				"thread"
			],
			reactions: true,
			threads: true,
			media: true,
			nativeCommands: true
		},
		agentPrompt: { messageToolHints: ({ cfg, accountId }) => isSlackInteractiveRepliesEnabled({
			cfg,
			accountId
		}) ? ["- Slack interactive replies: use `[[slack_buttons: Label:value, Other:other]]` to add action buttons that route clicks back as Slack interaction system events.", "- Slack selects: use `[[slack_select: Placeholder | Label:value, Other:other]]` to add a static select menu that routes the chosen value back as a Slack interaction system event."] : ["- Slack interactive replies are disabled. If needed, ask to set `channels.slack.capabilities.interactiveReplies=true` (or the same under `channels.slack.accounts.<account>.capabilities`)."] },
		streaming: { blockStreamingCoalesceDefaults: {
			minChars: 1500,
			idleMs: 1e3
		} },
		reload: { configPrefixes: ["channels.slack"] },
		configSchema: buildChannelConfigSchema(SlackConfigSchema),
		config: {
			...slackConfigBase,
			isConfigured: (account) => isSlackPluginAccountConfigured(account),
			describeAccount: (account) => ({
				accountId: account.accountId,
				name: account.name,
				enabled: account.enabled,
				configured: isSlackPluginAccountConfigured(account),
				botTokenSource: account.botTokenSource,
				appTokenSource: account.appTokenSource
			}),
			...slackConfigAccessors
		},
		setup: params.setup
	};
}
//#endregion
//#region extensions/slack/src/setup-core.ts
function enableSlackAccount(cfg, accountId) {
	return patchChannelConfigForAccount({
		cfg,
		channel: SLACK_CHANNEL,
		accountId,
		patch: { enabled: true }
	});
}
function createSlackTokenCredential(params) {
	return {
		inputKey: params.inputKey,
		providerHint: params.providerHint,
		credentialLabel: params.credentialLabel,
		preferredEnvVar: params.preferredEnvVar,
		envPrompt: `${params.preferredEnvVar} detected. Use env var?`,
		keepPrompt: params.keepPrompt,
		inputPrompt: params.inputPrompt,
		allowEnv: ({ accountId }) => accountId === DEFAULT_ACCOUNT_ID,
		inspect: ({ cfg, accountId }) => {
			const resolved = resolveSlackAccount({
				cfg,
				accountId
			});
			const configuredValue = params.inputKey === "botToken" ? resolved.config.botToken : resolved.config.appToken;
			const resolvedValue = params.inputKey === "botToken" ? resolved.botToken : resolved.appToken;
			return {
				accountConfigured: Boolean(resolvedValue) || hasConfiguredSecretInput(configuredValue),
				hasConfiguredValue: hasConfiguredSecretInput(configuredValue),
				resolvedValue: resolvedValue?.trim() || void 0,
				envValue: accountId === "default" ? process.env[params.preferredEnvVar]?.trim() : void 0
			};
		},
		applyUseEnv: ({ cfg, accountId }) => enableSlackAccount(cfg, accountId),
		applySet: ({ cfg, accountId, value }) => patchChannelConfigForAccount({
			cfg,
			channel: SLACK_CHANNEL,
			accountId,
			patch: {
				enabled: true,
				[params.inputKey]: value
			}
		})
	};
}
const slackSetupAdapter = createEnvPatchedAccountSetupAdapter({
	channelKey: SLACK_CHANNEL,
	defaultAccountOnlyEnvError: "Slack env tokens can only be used for the default account.",
	missingCredentialError: "Slack requires --bot-token and --app-token (or --use-env).",
	hasCredentials: (input) => Boolean(input.botToken && input.appToken),
	buildPatch: (input) => ({
		...input.botToken ? { botToken: input.botToken } : {},
		...input.appToken ? { appToken: input.appToken } : {}
	})
});
function createSlackSetupWizardBase(handlers) {
	const slackDmPolicy = {
		label: "Slack",
		channel: SLACK_CHANNEL,
		policyKey: "channels.slack.dmPolicy",
		allowFromKey: "channels.slack.allowFrom",
		getCurrent: (cfg) => cfg.channels?.slack?.dmPolicy ?? cfg.channels?.slack?.dm?.policy ?? "pairing",
		setPolicy: (cfg, policy) => setLegacyChannelDmPolicyWithAllowFrom({
			cfg,
			channel: SLACK_CHANNEL,
			dmPolicy: policy
		}),
		promptAllowFrom: handlers.promptAllowFrom
	};
	return {
		channel: SLACK_CHANNEL,
		status: {
			configuredLabel: "configured",
			unconfiguredLabel: "needs tokens",
			configuredHint: "configured",
			unconfiguredHint: "needs tokens",
			configuredScore: 2,
			unconfiguredScore: 1,
			resolveConfigured: ({ cfg }) => listSlackAccountIds(cfg).some((accountId) => {
				return inspectSlackAccount({
					cfg,
					accountId
				}).configured;
			})
		},
		introNote: {
			title: "Slack socket mode tokens",
			lines: buildSlackSetupLines(),
			shouldShow: ({ cfg, accountId }) => !isSlackSetupAccountConfigured(resolveSlackAccount({
				cfg,
				accountId
			}))
		},
		envShortcut: {
			prompt: "SLACK_BOT_TOKEN + SLACK_APP_TOKEN detected. Use env vars?",
			preferredEnvVar: "SLACK_BOT_TOKEN",
			isAvailable: ({ cfg, accountId }) => accountId === "default" && Boolean(process.env.SLACK_BOT_TOKEN?.trim()) && Boolean(process.env.SLACK_APP_TOKEN?.trim()) && !isSlackSetupAccountConfigured(resolveSlackAccount({
				cfg,
				accountId
			})),
			apply: ({ cfg, accountId }) => enableSlackAccount(cfg, accountId)
		},
		credentials: [createSlackTokenCredential({
			inputKey: "botToken",
			providerHint: "slack-bot",
			credentialLabel: "Slack bot token",
			preferredEnvVar: "SLACK_BOT_TOKEN",
			keepPrompt: "Slack bot token already configured. Keep it?",
			inputPrompt: "Enter Slack bot token (xoxb-...)"
		}), createSlackTokenCredential({
			inputKey: "appToken",
			providerHint: "slack-app",
			credentialLabel: "Slack app token",
			preferredEnvVar: "SLACK_APP_TOKEN",
			keepPrompt: "Slack app token already configured. Keep it?",
			inputPrompt: "Enter Slack app token (xapp-...)"
		})],
		dmPolicy: slackDmPolicy,
		allowFrom: {
			helpTitle: "Slack allowlist",
			helpLines: [
				"Allowlist Slack DMs by username (we resolve to user ids).",
				"Examples:",
				"- U12345678",
				"- @alice",
				"Multiple entries: comma-separated.",
				`Docs: ${formatDocsLink("/slack", "slack")}`
			],
			credentialInputKey: "botToken",
			message: "Slack allowFrom (usernames or ids)",
			placeholder: "@alice, U12345678",
			invalidWithoutCredentialNote: "Slack token missing; use user ids (or mention form) only.",
			parseId: (value) => parseMentionOrPrefixedId({
				value,
				mentionPattern: /^<@([A-Z0-9]+)>$/i,
				prefixPattern: /^(slack:|user:)/i,
				idPattern: /^[A-Z][A-Z0-9]+$/i,
				normalizeId: (id) => id.toUpperCase()
			}),
			resolveEntries: async ({ cfg, accountId, credentialValues, entries }) => await handlers.resolveAllowFromEntries({
				cfg,
				accountId,
				credentialValues,
				entries
			}),
			apply: ({ cfg, accountId, allowFrom }) => patchChannelConfigForAccount({
				cfg,
				channel: SLACK_CHANNEL,
				accountId,
				patch: {
					dmPolicy: "allowlist",
					allowFrom
				}
			})
		},
		groupAccess: {
			label: "Slack channels",
			placeholder: "#general, #private, C123",
			currentPolicy: ({ cfg, accountId }) => resolveSlackAccount({
				cfg,
				accountId
			}).config.groupPolicy ?? "allowlist",
			currentEntries: ({ cfg, accountId }) => Object.entries(resolveSlackAccount({
				cfg,
				accountId
			}).config.channels ?? {}).filter(([, value]) => value?.allow !== false && value?.enabled !== false).map(([key]) => key),
			updatePrompt: ({ cfg, accountId }) => Boolean(resolveSlackAccount({
				cfg,
				accountId
			}).config.channels),
			setPolicy: ({ cfg, accountId, policy }) => setAccountGroupPolicyForChannel({
				cfg,
				channel: SLACK_CHANNEL,
				accountId,
				groupPolicy: policy
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
						label: "Slack channels",
						error
					});
					await noteChannelLookupSummary({
						prompter,
						label: "Slack channels",
						resolvedSections: [],
						unresolved: entries
					});
					return entries;
				}
			},
			applyAllowlist: ({ cfg, accountId, resolved }) => setSlackChannelAllowlist(cfg, accountId, resolved)
		},
		disable: (cfg) => setSetupChannelEnabled(cfg, SLACK_CHANNEL, false)
	};
}
//#endregion
//#region extensions/slack/src/setup-surface.ts
async function resolveSlackAllowFromEntries(params) {
	if (!params.token?.trim()) return params.entries.map((input) => ({
		input,
		resolved: false,
		id: null
	}));
	return (await resolveSlackUserAllowlist({
		token: params.token,
		entries: params.entries
	})).map((entry) => ({
		input: entry.input,
		resolved: entry.resolved,
		id: entry.id ?? null
	}));
}
async function promptSlackAllowFrom(params) {
	const accountId = resolveSetupAccountId({
		accountId: params.accountId,
		defaultAccountId: resolveDefaultSlackAccountId(params.cfg)
	});
	const resolved = resolveSlackAccount({
		cfg: params.cfg,
		accountId
	});
	const token = resolved.userToken ?? resolved.botToken ?? "";
	const existing = params.cfg.channels?.slack?.allowFrom ?? params.cfg.channels?.slack?.dm?.allowFrom ?? [];
	const parseId = (value) => parseMentionOrPrefixedId({
		value,
		mentionPattern: /^<@([A-Z0-9]+)>$/i,
		prefixPattern: /^(slack:|user:)/i,
		idPattern: /^[A-Z][A-Z0-9]+$/i,
		normalizeId: (id) => id.toUpperCase()
	});
	return promptLegacyChannelAllowFrom({
		cfg: params.cfg,
		channel: SLACK_CHANNEL,
		prompter: params.prompter,
		existing,
		token,
		noteTitle: "Slack allowlist",
		noteLines: [
			"Allowlist Slack DMs by username (we resolve to user ids).",
			"Examples:",
			"- U12345678",
			"- @alice",
			"Multiple entries: comma-separated.",
			`Docs: ${formatDocsLink("/slack", "slack")}`
		],
		message: "Slack allowFrom (usernames or ids)",
		placeholder: "@alice, U12345678",
		parseId,
		invalidWithoutTokenNote: "Slack token missing; use user ids (or mention form) only.",
		resolveEntries: ({ token, entries }) => resolveSlackUserAllowlist({
			token,
			entries
		})
	});
}
async function resolveSlackGroupAllowlist(params) {
	let keys = params.entries;
	const activeBotToken = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).botToken || params.credentialValues.botToken || "";
	if (activeBotToken && params.entries.length > 0) try {
		const resolved = await resolveSlackChannelAllowlist({
			token: activeBotToken,
			entries: params.entries
		});
		const resolvedKeys = resolved.filter((entry) => entry.resolved && entry.id).map((entry) => entry.id);
		const unresolved = resolved.filter((entry) => !entry.resolved).map((entry) => entry.input);
		keys = [...resolvedKeys, ...unresolved.map((entry) => entry.trim()).filter(Boolean)];
		await noteChannelLookupSummary({
			prompter: params.prompter,
			label: "Slack channels",
			resolvedSections: [{
				title: "Resolved",
				values: resolvedKeys
			}],
			unresolved
		});
	} catch (error) {
		await noteChannelLookupFailure({
			prompter: params.prompter,
			label: "Slack channels",
			error
		});
	}
	return keys;
}
const slackSetupWizard = createSlackSetupWizardBase({
	promptAllowFrom: promptSlackAllowFrom,
	resolveAllowFromEntries: async ({ credentialValues, entries }) => await resolveSlackAllowFromEntries({
		token: credentialValues.botToken,
		entries
	}),
	resolveGroupAllowlist: async ({ cfg, accountId, credentialValues, entries, prompter }) => await resolveSlackGroupAllowlist({
		cfg,
		accountId,
		credentialValues,
		entries,
		prompter
	})
});
//#endregion
export { isSlackPluginAccountConfigured as a, createSlackPluginBase as i, slackSetupAdapter as n, slackConfigAccessors as o, SLACK_CHANNEL as r, slackSetupWizard as t };
