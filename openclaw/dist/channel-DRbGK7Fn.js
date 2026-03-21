import { Aa as fetchChannelPermissionsDiscord, KC as buildComputedAccountStatusSnapshot, Li as collectDiscordStatusIssues, RS as getExecApprovalReplyMetadata, RT as collectOpenGroupPolicyConfiguredRouteWarnings, VT as collectOpenProviderGroupPolicyWarnings, X as parseDiscordTarget, YC as buildTokenChannelStatusSummary, YS as listDiscordAccountIds, ZS as resolveDiscordAccount, _r as resolveDiscordGroupRequireMention, db as looksLikeDiscordTargetId, dw as listDiscordDirectoryGroupsFromConfig, ew as projectCredentialSnapshotFields, fb as normalizeDiscordMessagingTarget, fw as listDiscordDirectoryPeersFromConfig, kT as buildAccountScopedDmSecurityPolicy, nw as resolveConfiguredFromCredentialStatuses, pb as normalizeDiscordOutboundTarget, uu as resolveOutboundSendDep, vr as resolveDiscordGroupToolPolicy, ww as PAIRING_APPROVED_MESSAGE, zi as collectDiscordAuditChannelIds } from "./auth-profiles-Bc6TPi0n.js";
import { d as resolveThreadSessionKeys } from "./session-key-DyhRsRh-.js";
import { t as DEFAULT_ACCOUNT_ID } from "./account-id-O4Og6DrK.js";
import { r as getChatChannelMeta } from "./registry-jBzBWMf6.js";
import { f as normalizeMessageChannel } from "./message-channel-C4icaB2h.js";
import { a as buildOutboundBaseSessionKey, i as normalizeOutboundThreadId } from "./core-TgQ7U3Ou.js";
import { t as createPluginRuntimeStore } from "./runtime-store-BIrp4FYB.js";
import { n as resolveLegacyDmAllowlistConfigPaths, t as buildAccountScopedAllowlistConfigEditor } from "./allowlist-config-edit-CzEoX8BU.js";
import { t as resolveDiscordUserAllowlist } from "./resolve-users-C8R-7RB0.js";
import { r as discordSetupAdapter } from "./setup-core-DwZ_G2We.js";
import { n as discordConfigAccessors, t as createDiscordPluginBase } from "./shared-C1K1TlLJ.js";
import { t as DiscordUiContainer } from "./ui-BnvfuRLZ.js";
import { Separator, TextDisplay } from "@buape/carbon";
//#region extensions/discord/src/exec-approvals.ts
function isDiscordExecApprovalClientEnabled(params) {
	const config = resolveDiscordAccount(params).config.execApprovals;
	return Boolean(config?.enabled && (config.approvers?.length ?? 0) > 0);
}
function shouldSuppressLocalDiscordExecApprovalPrompt(params) {
	return isDiscordExecApprovalClientEnabled(params) && getExecApprovalReplyMetadata(params.payload) !== null;
}
//#endregion
//#region extensions/discord/src/runtime.ts
const { setRuntime: setDiscordRuntime, getRuntime: getDiscordRuntime } = createPluginRuntimeStore("Discord runtime not initialized");
//#endregion
//#region extensions/discord/src/channel.ts
getChatChannelMeta("discord");
const REQUIRED_DISCORD_PERMISSIONS = ["ViewChannel", "SendMessages"];
function formatDiscordIntents(intents) {
	if (!intents) return "unknown";
	return [
		`messageContent=${intents.messageContent ?? "unknown"}`,
		`guildMembers=${intents.guildMembers ?? "unknown"}`,
		`presence=${intents.presence ?? "unknown"}`
	].join(" ");
}
const discordMessageActions = {
	listActions: (ctx) => getDiscordRuntime().channel.discord.messageActions?.listActions?.(ctx) ?? [],
	getCapabilities: (ctx) => getDiscordRuntime().channel.discord.messageActions?.getCapabilities?.(ctx) ?? [],
	extractToolSend: (ctx) => getDiscordRuntime().channel.discord.messageActions?.extractToolSend?.(ctx) ?? null,
	handleAction: async (ctx) => {
		const ma = getDiscordRuntime().channel.discord.messageActions;
		if (!ma?.handleAction) throw new Error("Discord message actions not available");
		return ma.handleAction(ctx);
	},
	requiresTrustedRequesterSender: ({ action, toolContext }) => Boolean(toolContext && (action === "timeout" || action === "kick" || action === "ban"))
};
function buildDiscordCrossContextComponents(params) {
	const trimmed = params.message.trim();
	const components = [];
	if (trimmed) {
		components.push(new TextDisplay(params.message));
		components.push(new Separator({
			divider: true,
			spacing: "small"
		}));
	}
	components.push(new TextDisplay(`*From ${params.originLabel}*`));
	return [new DiscordUiContainer({
		cfg: params.cfg,
		accountId: params.accountId,
		components
	})];
}
function hasDiscordExecApprovalDmRoute(cfg) {
	return listDiscordAccountIds(cfg).some((accountId) => {
		const execApprovals = resolveDiscordAccount({
			cfg,
			accountId
		}).config.execApprovals;
		if (!execApprovals?.enabled || (execApprovals.approvers?.length ?? 0) === 0) return false;
		const target = execApprovals.target ?? "dm";
		return target === "dm" || target === "both";
	});
}
function readDiscordAllowlistConfig(account) {
	const groupOverrides = [];
	for (const [guildKey, guildCfg] of Object.entries(account.config.guilds ?? {})) {
		const entries = (guildCfg?.users ?? []).map(String).filter(Boolean);
		if (entries.length > 0) groupOverrides.push({
			label: `guild ${guildKey}`,
			entries
		});
		for (const [channelKey, channelCfg] of Object.entries(guildCfg?.channels ?? {})) {
			const channelEntries = (channelCfg?.users ?? []).map(String).filter(Boolean);
			if (channelEntries.length > 0) groupOverrides.push({
				label: `guild ${guildKey} / channel ${channelKey}`,
				entries: channelEntries
			});
		}
	}
	return {
		dmAllowFrom: (account.config.allowFrom ?? account.config.dm?.allowFrom ?? []).map(String),
		groupPolicy: account.config.groupPolicy,
		groupOverrides
	};
}
async function resolveDiscordAllowlistNames(params) {
	const token = resolveDiscordAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).token?.trim();
	if (!token) return [];
	return await resolveDiscordUserAllowlist({
		token,
		entries: params.entries
	});
}
function normalizeDiscordAcpConversationId(conversationId) {
	const normalized = conversationId.trim();
	return normalized ? { conversationId: normalized } : null;
}
function matchDiscordAcpConversation(params) {
	if (params.bindingConversationId === params.conversationId) return {
		conversationId: params.conversationId,
		matchPriority: 2
	};
	if (params.parentConversationId && params.parentConversationId !== params.conversationId && params.bindingConversationId === params.parentConversationId) return {
		conversationId: params.parentConversationId,
		matchPriority: 1
	};
	return null;
}
function parseDiscordExplicitTarget(raw) {
	try {
		const target = parseDiscordTarget(raw, { defaultKind: "channel" });
		if (!target) return null;
		return {
			to: target.id,
			chatType: target.kind === "user" ? "direct" : "channel"
		};
	} catch {
		return null;
	}
}
function buildDiscordBaseSessionKey(params) {
	return buildOutboundBaseSessionKey({
		...params,
		channel: "discord"
	});
}
function resolveDiscordOutboundTargetKindHint(params) {
	const resolvedKind = params.resolvedTarget?.kind;
	if (resolvedKind === "user") return "user";
	if (resolvedKind === "group" || resolvedKind === "channel") return "channel";
	const target = params.target.trim();
	if (/^channel:/i.test(target)) return "channel";
	if (/^(user:|discord:|@|<@!?)/i.test(target)) return "user";
}
function resolveDiscordOutboundSessionRoute(params) {
	const parsed = parseDiscordTarget(params.target, { defaultKind: resolveDiscordOutboundTargetKindHint(params) });
	if (!parsed) return null;
	const isDm = parsed.kind === "user";
	const peer = {
		kind: isDm ? "direct" : "channel",
		id: parsed.id
	};
	const baseSessionKey = buildDiscordBaseSessionKey({
		cfg: params.cfg,
		agentId: params.agentId,
		accountId: params.accountId,
		peer
	});
	const explicitThreadId = normalizeOutboundThreadId(params.threadId);
	return {
		sessionKey: resolveThreadSessionKeys({
			baseSessionKey,
			threadId: explicitThreadId ?? normalizeOutboundThreadId(params.replyToId),
			useSuffix: false
		}).sessionKey,
		baseSessionKey,
		peer,
		chatType: isDm ? "direct" : "channel",
		from: isDm ? `discord:${parsed.id}` : `discord:channel:${parsed.id}`,
		to: isDm ? `user:${parsed.id}` : `channel:${parsed.id}`,
		threadId: explicitThreadId ?? void 0
	};
}
const discordPlugin = {
	...createDiscordPluginBase({ setup: discordSetupAdapter }),
	pairing: {
		idLabel: "discordUserId",
		normalizeAllowEntry: (entry) => entry.replace(/^(discord|user):/i, ""),
		notifyApproval: async ({ id }) => {
			await getDiscordRuntime().channel.discord.sendMessageDiscord(`user:${id}`, PAIRING_APPROVED_MESSAGE);
		}
	},
	allowlist: {
		supportsScope: ({ scope }) => scope === "dm",
		readConfig: ({ cfg, accountId }) => readDiscordAllowlistConfig(resolveDiscordAccount({
			cfg,
			accountId
		})),
		resolveNames: async ({ cfg, accountId, entries }) => await resolveDiscordAllowlistNames({
			cfg,
			accountId,
			entries
		}),
		applyConfigEdit: buildAccountScopedAllowlistConfigEditor({
			channelId: "discord",
			normalize: ({ cfg, accountId, values }) => discordConfigAccessors.formatAllowFrom({
				cfg,
				accountId,
				allowFrom: values
			}),
			resolvePaths: resolveLegacyDmAllowlistConfigPaths
		})
	},
	security: {
		resolveDmPolicy: ({ cfg, accountId, account }) => {
			return buildAccountScopedDmSecurityPolicy({
				cfg,
				channelKey: "discord",
				accountId,
				fallbackAccountId: account.accountId ?? "default",
				policy: account.config.dm?.policy,
				allowFrom: account.config.dm?.allowFrom ?? [],
				allowFromPathSuffix: "dm.",
				normalizeEntry: (raw) => raw.replace(/^(discord|user):/i, "").replace(/^<@!?(\d+)>$/, "$1")
			});
		},
		collectWarnings: ({ account, cfg }) => {
			const guildEntries = account.config.guilds ?? {};
			const channelAllowlistConfigured = Object.keys(guildEntries).length > 0;
			return collectOpenProviderGroupPolicyWarnings({
				cfg,
				providerConfigPresent: cfg.channels?.discord !== void 0,
				configuredGroupPolicy: account.config.groupPolicy,
				collect: (groupPolicy) => collectOpenGroupPolicyConfiguredRouteWarnings({
					groupPolicy,
					routeAllowlistConfigured: channelAllowlistConfigured,
					configureRouteAllowlist: {
						surface: "Discord guilds",
						openScope: "any channel not explicitly denied",
						groupPolicyPath: "channels.discord.groupPolicy",
						routeAllowlistPath: "channels.discord.guilds.<id>.channels"
					},
					missingRouteAllowlist: {
						surface: "Discord guilds",
						openBehavior: "with no guild/channel allowlist; any channel can trigger (mention-gated)",
						remediation: "Set channels.discord.groupPolicy=\"allowlist\" and configure channels.discord.guilds.<id>.channels"
					}
				})
			});
		}
	},
	groups: {
		resolveRequireMention: resolveDiscordGroupRequireMention,
		resolveToolPolicy: resolveDiscordGroupToolPolicy
	},
	mentions: { stripPatterns: () => ["<@!?\\d+>"] },
	threading: { resolveReplyToMode: ({ cfg }) => cfg.channels?.discord?.replyToMode ?? "off" },
	agentPrompt: { messageToolHints: () => ["- Discord components: set `components` when sending messages to include buttons, selects, or v2 containers.", "- Forms: add `components.modal` (title, fields). OpenClaw adds a trigger button and routes submissions as new messages."] },
	messaging: {
		normalizeTarget: normalizeDiscordMessagingTarget,
		parseExplicitTarget: ({ raw }) => parseDiscordExplicitTarget(raw),
		inferTargetChatType: ({ to }) => parseDiscordExplicitTarget(to)?.chatType,
		buildCrossContextComponents: buildDiscordCrossContextComponents,
		resolveOutboundSessionRoute: (params) => resolveDiscordOutboundSessionRoute(params),
		targetResolver: {
			looksLikeId: looksLikeDiscordTargetId,
			hint: "<channelId|user:ID|channel:ID>"
		}
	},
	execApprovals: {
		getInitiatingSurfaceState: ({ cfg, accountId }) => isDiscordExecApprovalClientEnabled({
			cfg,
			accountId
		}) ? { kind: "enabled" } : { kind: "disabled" },
		shouldSuppressLocalPrompt: ({ cfg, accountId, payload }) => shouldSuppressLocalDiscordExecApprovalPrompt({
			cfg,
			accountId,
			payload
		}),
		hasConfiguredDmRoute: ({ cfg }) => hasDiscordExecApprovalDmRoute(cfg),
		shouldSuppressForwardingFallback: ({ cfg, target }) => (normalizeMessageChannel(target.channel) ?? target.channel) === "discord" && isDiscordExecApprovalClientEnabled({
			cfg,
			accountId: target.accountId
		})
	},
	directory: {
		self: async () => null,
		listPeers: async (params) => listDiscordDirectoryPeersFromConfig(params),
		listGroups: async (params) => listDiscordDirectoryGroupsFromConfig(params),
		listPeersLive: async (params) => getDiscordRuntime().channel.discord.listDirectoryPeersLive(params),
		listGroupsLive: async (params) => getDiscordRuntime().channel.discord.listDirectoryGroupsLive(params)
	},
	resolver: { resolveTargets: async ({ cfg, accountId, inputs, kind }) => {
		const token = resolveDiscordAccount({
			cfg,
			accountId
		}).token?.trim();
		if (!token) return inputs.map((input) => ({
			input,
			resolved: false,
			note: "missing Discord token"
		}));
		if (kind === "group") return (await getDiscordRuntime().channel.discord.resolveChannelAllowlist({
			token,
			entries: inputs
		})).map((entry) => ({
			input: entry.input,
			resolved: entry.resolved,
			id: entry.channelId ?? entry.guildId,
			name: entry.channelName ?? entry.guildName ?? (entry.guildId && !entry.channelId ? entry.guildId : void 0),
			note: entry.note
		}));
		return (await getDiscordRuntime().channel.discord.resolveUserAllowlist({
			token,
			entries: inputs
		})).map((entry) => ({
			input: entry.input,
			resolved: entry.resolved,
			id: entry.id,
			name: entry.name,
			note: entry.note
		}));
	} },
	actions: discordMessageActions,
	setup: discordSetupAdapter,
	outbound: {
		deliveryMode: "direct",
		chunker: null,
		textChunkLimit: 2e3,
		pollMaxOptions: 10,
		resolveTarget: ({ to }) => normalizeDiscordOutboundTarget(to),
		sendText: async ({ cfg, to, text, accountId, deps, replyToId, silent }) => {
			return {
				channel: "discord",
				...await (resolveOutboundSendDep(deps, "discord") ?? getDiscordRuntime().channel.discord.sendMessageDiscord)(to, text, {
					verbose: false,
					cfg,
					replyTo: replyToId ?? void 0,
					accountId: accountId ?? void 0,
					silent: silent ?? void 0
				})
			};
		},
		sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, accountId, deps, replyToId, silent }) => {
			return {
				channel: "discord",
				...await (resolveOutboundSendDep(deps, "discord") ?? getDiscordRuntime().channel.discord.sendMessageDiscord)(to, text, {
					verbose: false,
					cfg,
					mediaUrl,
					mediaLocalRoots,
					replyTo: replyToId ?? void 0,
					accountId: accountId ?? void 0,
					silent: silent ?? void 0
				})
			};
		},
		sendPoll: async ({ cfg, to, poll, accountId, silent }) => await getDiscordRuntime().channel.discord.sendPollDiscord(to, poll, {
			cfg,
			accountId: accountId ?? void 0,
			silent: silent ?? void 0
		})
	},
	acpBindings: {
		normalizeConfiguredBindingTarget: ({ conversationId }) => normalizeDiscordAcpConversationId(conversationId),
		matchConfiguredBinding: ({ bindingConversationId, conversationId, parentConversationId }) => matchDiscordAcpConversation({
			bindingConversationId,
			conversationId,
			parentConversationId
		})
	},
	status: {
		defaultRuntime: {
			accountId: DEFAULT_ACCOUNT_ID,
			running: false,
			connected: false,
			reconnectAttempts: 0,
			lastConnectedAt: null,
			lastDisconnect: null,
			lastEventAt: null,
			lastStartAt: null,
			lastStopAt: null,
			lastError: null
		},
		collectStatusIssues: collectDiscordStatusIssues,
		buildChannelSummary: ({ snapshot }) => buildTokenChannelStatusSummary(snapshot, { includeMode: false }),
		probeAccount: async ({ account, timeoutMs }) => getDiscordRuntime().channel.discord.probeDiscord(account.token, timeoutMs, { includeApplication: true }),
		formatCapabilitiesProbe: ({ probe }) => {
			const discordProbe = probe;
			const lines = [];
			if (discordProbe?.bot?.username) {
				const botId = discordProbe.bot.id ? ` (${discordProbe.bot.id})` : "";
				lines.push({ text: `Bot: @${discordProbe.bot.username}${botId}` });
			}
			if (discordProbe?.application?.intents) lines.push({ text: `Intents: ${formatDiscordIntents(discordProbe.application.intents)}` });
			return lines;
		},
		buildCapabilitiesDiagnostics: async ({ account, timeoutMs, target }) => {
			if (!target?.trim()) return;
			const parsedTarget = parseDiscordTarget(target.trim(), { defaultKind: "channel" });
			const details = { target: {
				raw: target,
				normalized: parsedTarget?.normalized,
				kind: parsedTarget?.kind,
				channelId: parsedTarget?.kind === "channel" ? parsedTarget.id : void 0
			} };
			if (!parsedTarget || parsedTarget.kind !== "channel") return {
				details,
				lines: [{
					text: "Permissions: Target looks like a DM user; pass channel:<id> to audit channel permissions.",
					tone: "error"
				}]
			};
			const token = account.token?.trim();
			if (!token) return {
				details,
				lines: [{
					text: "Permissions: Discord bot token missing for permission audit.",
					tone: "error"
				}]
			};
			try {
				const perms = await fetchChannelPermissionsDiscord(parsedTarget.id, {
					token,
					accountId: account.accountId ?? void 0
				});
				const missingRequired = REQUIRED_DISCORD_PERMISSIONS.filter((permission) => !perms.permissions.includes(permission));
				details.permissions = {
					channelId: perms.channelId,
					guildId: perms.guildId,
					isDm: perms.isDm,
					channelType: perms.channelType,
					permissions: perms.permissions,
					missingRequired,
					raw: perms.raw
				};
				return {
					details,
					lines: [{ text: `Permissions (${perms.channelId}): ${perms.permissions.length ? perms.permissions.join(", ") : "none"}` }, missingRequired.length > 0 ? {
						text: `Missing required: ${missingRequired.join(", ")}`,
						tone: "warn"
					} : {
						text: "Missing required: none",
						tone: "success"
					}]
				};
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				details.permissions = {
					channelId: parsedTarget.id,
					error: message
				};
				return {
					details,
					lines: [{
						text: `Permissions: ${message}`,
						tone: "error"
					}]
				};
			}
		},
		auditAccount: async ({ account, timeoutMs, cfg }) => {
			const { channelIds, unresolvedChannels } = collectDiscordAuditChannelIds({
				cfg,
				accountId: account.accountId
			});
			if (!channelIds.length && unresolvedChannels === 0) return;
			const botToken = account.token?.trim();
			if (!botToken) return {
				ok: unresolvedChannels === 0,
				checkedChannels: 0,
				unresolvedChannels,
				channels: [],
				elapsedMs: 0
			};
			return {
				...await getDiscordRuntime().channel.discord.auditChannelPermissions({
					token: botToken,
					accountId: account.accountId,
					channelIds,
					timeoutMs
				}),
				unresolvedChannels
			};
		},
		buildAccountSnapshot: ({ account, runtime, probe, audit }) => {
			const configured = resolveConfiguredFromCredentialStatuses(account) ?? Boolean(account.token?.trim());
			const app = runtime?.application ?? probe?.application;
			const bot = runtime?.bot ?? probe?.bot;
			return {
				...buildComputedAccountStatusSnapshot({
					accountId: account.accountId,
					name: account.name,
					enabled: account.enabled,
					configured,
					runtime,
					probe
				}),
				...projectCredentialSnapshotFields(account),
				connected: runtime?.connected ?? false,
				reconnectAttempts: runtime?.reconnectAttempts,
				lastConnectedAt: runtime?.lastConnectedAt ?? null,
				lastDisconnect: runtime?.lastDisconnect ?? null,
				lastEventAt: runtime?.lastEventAt ?? null,
				application: app ?? void 0,
				bot: bot ?? void 0,
				audit
			};
		}
	},
	gateway: { startAccount: async (ctx) => {
		const account = ctx.account;
		const token = account.token.trim();
		let discordBotLabel = "";
		try {
			const probe = await getDiscordRuntime().channel.discord.probeDiscord(token, 2500, { includeApplication: true });
			const username = probe.ok ? probe.bot?.username?.trim() : null;
			if (username) discordBotLabel = ` (@${username})`;
			ctx.setStatus({
				accountId: account.accountId,
				bot: probe.bot,
				application: probe.application
			});
			const messageContent = probe.application?.intents?.messageContent;
			if (messageContent === "disabled") ctx.log?.warn(`[${account.accountId}] Discord Message Content Intent is disabled; bot may not respond to channel messages. Enable it in Discord Dev Portal (Bot → Privileged Gateway Intents) or require mentions.`);
			else if (messageContent === "limited") ctx.log?.info(`[${account.accountId}] Discord Message Content Intent is limited; bots under 100 servers can use it without verification.`);
		} catch (err) {
			if (getDiscordRuntime().logging.shouldLogVerbose()) ctx.log?.debug?.(`[${account.accountId}] bot probe failed: ${String(err)}`);
		}
		ctx.log?.info(`[${account.accountId}] starting provider${discordBotLabel}`);
		return getDiscordRuntime().channel.discord.monitorDiscordProvider({
			token,
			accountId: account.accountId,
			config: ctx.cfg,
			runtime: ctx.runtime,
			abortSignal: ctx.abortSignal,
			mediaMaxMb: account.config.mediaMaxMb,
			historyLimit: account.config.historyLimit,
			setStatus: (patch) => ctx.setStatus({
				accountId: account.accountId,
				...patch
			})
		});
	} }
};
//#endregion
export { setDiscordRuntime as n, discordPlugin as t };
