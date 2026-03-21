import { d as isRecord } from "./utils-BMtC0Ocd.js";
import { Cr as resolveSlackGroupToolPolicy, KC as buildComputedAccountStatusSnapshot, Nx as resolveSlackAccount, Or as createSlackActions, Px as resolveSlackReplyToMode, RT as collectOpenGroupPolicyConfiguredRouteWarnings, Sr as resolveSlackGroupRequireMention, VT as collectOpenProviderGroupPolicyWarnings, bw as normalizeSlackMessagingTarget, ci as parseSlackBlocksInput, ew as projectCredentialSnapshotFields, kT as buildAccountScopedDmSecurityPolicy, kx as isSlackInteractiveRepliesEnabled, li as buildSlackThreadingToolContext, mw as listSlackDirectoryPeersFromConfig, pw as listSlackDirectoryGroupsFromConfig, ri as createSlackWebClient, rw as resolveConfiguredFromRequiredCredentialStatuses, uu as resolveOutboundSendDep, ww as PAIRING_APPROVED_MESSAGE, xw as parseSlackTarget, yw as looksLikeSlackTargetId } from "./auth-profiles-Bc6TPi0n.js";
import { d as resolveThreadSessionKeys } from "./session-key-DyhRsRh-.js";
import { t as DEFAULT_ACCOUNT_ID } from "./account-id-O4Og6DrK.js";
import { a as buildOutboundBaseSessionKey, i as normalizeOutboundThreadId } from "./core-TgQ7U3Ou.js";
import { t as createPluginRuntimeStore } from "./runtime-store-BIrp4FYB.js";
import { n as resolveLegacyDmAllowlistConfigPaths, t as buildAccountScopedAllowlistConfigEditor } from "./allowlist-config-edit-CzEoX8BU.js";
import { n as buildPassiveProbedChannelStatusSummary } from "./channel-status-summary-CqaCAvAP.js";
import { r as normalizeAllowListLower } from "./allow-list-De58INdg.js";
import { n as resolveSlackUserAllowlist } from "./resolve-channels-faZ2F1NK.js";
import { a as isSlackPluginAccountConfigured, i as createSlackPluginBase, n as slackSetupAdapter, o as slackConfigAccessors, r as SLACK_CHANNEL, t as slackSetupWizard } from "./setup-surface-DT_jZOM0.js";
//#region extensions/slack/src/runtime.ts
const { setRuntime: setSlackRuntime, getRuntime: getSlackRuntime } = createPluginRuntimeStore("Slack runtime not initialized");
//#endregion
//#region extensions/slack/src/scopes.ts
function collectScopes(value, into) {
	if (!value) return;
	if (Array.isArray(value)) {
		for (const entry of value) if (typeof entry === "string" && entry.trim()) into.push(entry.trim());
		return;
	}
	if (typeof value === "string") {
		const raw = value.trim();
		if (!raw) return;
		const parts = raw.split(/[,\s]+/).map((part) => part.trim());
		for (const part of parts) if (part) into.push(part);
		return;
	}
	if (!isRecord(value)) return;
	for (const entry of Object.values(value)) if (Array.isArray(entry) || typeof entry === "string") collectScopes(entry, into);
}
function normalizeScopes(scopes) {
	return Array.from(new Set(scopes.map((scope) => scope.trim()).filter(Boolean))).toSorted();
}
function extractScopes(payload) {
	if (!isRecord(payload)) return [];
	const scopes = [];
	collectScopes(payload.scopes, scopes);
	collectScopes(payload.scope, scopes);
	if (isRecord(payload.info)) {
		collectScopes(payload.info.scopes, scopes);
		collectScopes(payload.info.scope, scopes);
		collectScopes(payload.info.user_scopes, scopes);
		collectScopes(payload.info.bot_scopes, scopes);
	}
	return normalizeScopes(scopes);
}
function readError(payload) {
	if (!isRecord(payload)) return;
	const error = payload.error;
	return typeof error === "string" && error.trim() ? error.trim() : void 0;
}
async function callSlack(client, method) {
	try {
		const result = await client.apiCall(method);
		return isRecord(result) ? result : null;
	} catch (err) {
		return {
			ok: false,
			error: err instanceof Error ? err.message : String(err)
		};
	}
}
async function fetchSlackScopes(token, timeoutMs) {
	const client = createSlackWebClient(token, { timeout: timeoutMs });
	const attempts = ["auth.scopes", "apps.permissions.info"];
	const errors = [];
	for (const method of attempts) {
		const result = await callSlack(client, method);
		const scopes = extractScopes(result);
		if (scopes.length > 0) return {
			ok: true,
			scopes,
			source: method
		};
		const error = readError(result);
		if (error) errors.push(`${method}: ${error}`);
	}
	return {
		ok: false,
		error: errors.length > 0 ? errors.join(" | ") : "no scopes returned"
	};
}
//#endregion
//#region extensions/slack/src/channel.ts
const SLACK_CHANNEL_TYPE_CACHE = /* @__PURE__ */ new Map();
function getTokenForOperation(account, operation) {
	const userToken = account.config.userToken?.trim() || void 0;
	const botToken = account.botToken?.trim();
	const allowUserWrites = account.config.userTokenReadOnly === false;
	if (operation === "read") return userToken ?? botToken;
	if (!allowUserWrites) return botToken;
	return botToken ?? userToken;
}
function resolveSlackSendContext(params) {
	const send = resolveOutboundSendDep(params.deps, "slack") ?? getSlackRuntime().channel.slack.sendMessageSlack;
	const account = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const token = getTokenForOperation(account, "write");
	const botToken = account.botToken?.trim();
	const tokenOverride = token && token !== botToken ? token : void 0;
	return {
		send,
		threadTsValue: params.replyToId ?? params.threadId,
		tokenOverride
	};
}
function resolveSlackAutoThreadId(params) {
	const context = params.toolContext;
	if (!context?.currentThreadTs || !context.currentChannelId) return;
	if (context.replyToMode !== "all" && context.replyToMode !== "first") return;
	const parsedTarget = parseSlackTarget(params.to, { defaultKind: "channel" });
	if (!parsedTarget || parsedTarget.kind !== "channel") return;
	if (parsedTarget.id.toLowerCase() !== context.currentChannelId.toLowerCase()) return;
	if (context.replyToMode === "first" && context.hasRepliedRef?.value) return;
	return context.currentThreadTs;
}
function parseSlackExplicitTarget(raw) {
	const target = parseSlackTarget(raw, { defaultKind: "channel" });
	if (!target) return null;
	return {
		to: target.id,
		chatType: target.kind === "user" ? "direct" : "channel"
	};
}
function buildSlackBaseSessionKey(params) {
	return buildOutboundBaseSessionKey({
		...params,
		channel: "slack"
	});
}
async function resolveSlackChannelType(params) {
	const channelId = params.channelId.trim();
	if (!channelId) return "unknown";
	const cacheKey = `${params.accountId ?? "default"}:${channelId}`;
	const cached = SLACK_CHANNEL_TYPE_CACHE.get(cacheKey);
	if (cached) return cached;
	const account = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const groupChannels = normalizeAllowListLower(account.dm?.groupChannels);
	const channelIdLower = channelId.toLowerCase();
	if (groupChannels.includes(channelIdLower) || groupChannels.includes(`slack:${channelIdLower}`) || groupChannels.includes(`channel:${channelIdLower}`) || groupChannels.includes(`group:${channelIdLower}`) || groupChannels.includes(`mpim:${channelIdLower}`)) {
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, "group");
		return "group";
	}
	if (Object.keys(account.channels ?? {}).some((key) => {
		const normalized = key.trim().toLowerCase();
		return normalized === channelIdLower || normalized === `channel:${channelIdLower}` || normalized.replace(/^#/, "") === channelIdLower;
	})) {
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, "channel");
		return "channel";
	}
	const token = account.botToken?.trim() || account.config.userToken?.trim() || "";
	if (!token) {
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, "unknown");
		return "unknown";
	}
	try {
		const channel = (await createSlackWebClient(token).conversations.info({ channel: channelId })).channel;
		const type = channel?.is_im ? "dm" : channel?.is_mpim ? "group" : "channel";
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, type);
		return type;
	} catch {
		SLACK_CHANNEL_TYPE_CACHE.set(cacheKey, "unknown");
		return "unknown";
	}
}
async function resolveSlackOutboundSessionRoute(params) {
	const parsed = parseSlackTarget(params.target, { defaultKind: "channel" });
	if (!parsed) return null;
	const isDm = parsed.kind === "user";
	let peerKind = isDm ? "direct" : "channel";
	if (!isDm && /^G/i.test(parsed.id)) {
		const channelType = await resolveSlackChannelType({
			cfg: params.cfg,
			accountId: params.accountId,
			channelId: parsed.id
		});
		if (channelType === "group") peerKind = "group";
		if (channelType === "dm") peerKind = "direct";
	}
	const peer = {
		kind: peerKind,
		id: parsed.id
	};
	const baseSessionKey = buildSlackBaseSessionKey({
		cfg: params.cfg,
		agentId: params.agentId,
		accountId: params.accountId,
		peer
	});
	const threadId = normalizeOutboundThreadId(params.threadId ?? params.replyToId);
	return {
		sessionKey: resolveThreadSessionKeys({
			baseSessionKey,
			threadId
		}).sessionKey,
		baseSessionKey,
		peer,
		chatType: peerKind === "direct" ? "direct" : "channel",
		from: peerKind === "direct" ? `slack:${parsed.id}` : peerKind === "group" ? `slack:group:${parsed.id}` : `slack:channel:${parsed.id}`,
		to: peerKind === "direct" ? `user:${parsed.id}` : `channel:${parsed.id}`,
		threadId
	};
}
function formatSlackScopeDiagnostic(params) {
	const source = params.result.source ? ` (${params.result.source})` : "";
	const label = params.tokenType === "user" ? "User scopes" : "Bot scopes";
	if (params.result.ok && params.result.scopes?.length) return { text: `${label}${source}: ${params.result.scopes.join(", ")}` };
	return {
		text: `${label}: ${params.result.error ?? "scope lookup failed"}`,
		tone: "error"
	};
}
function readSlackAllowlistConfig(account) {
	return {
		dmAllowFrom: (account.config.allowFrom ?? account.config.dm?.allowFrom ?? []).map(String),
		groupPolicy: account.groupPolicy,
		groupOverrides: Object.entries(account.channels ?? {}).map(([key, value]) => {
			const entries = (value?.users ?? []).map(String).filter(Boolean);
			return entries.length > 0 ? {
				label: key,
				entries
			} : null;
		}).filter(Boolean)
	};
}
async function resolveSlackAllowlistNames(params) {
	const account = resolveSlackAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	const token = account.config.userToken?.trim() || account.botToken?.trim();
	if (!token) return [];
	return await resolveSlackUserAllowlist({
		token,
		entries: params.entries
	});
}
const slackPlugin = {
	...createSlackPluginBase({
		setupWizard: slackSetupWizard,
		setup: slackSetupAdapter
	}),
	pairing: {
		idLabel: "slackUserId",
		normalizeAllowEntry: (entry) => entry.replace(/^(slack|user):/i, ""),
		notifyApproval: async ({ id }) => {
			const account = resolveSlackAccount({
				cfg: getSlackRuntime().config.loadConfig(),
				accountId: DEFAULT_ACCOUNT_ID
			});
			const token = getTokenForOperation(account, "write");
			const botToken = account.botToken?.trim();
			const tokenOverride = token && token !== botToken ? token : void 0;
			if (tokenOverride) await getSlackRuntime().channel.slack.sendMessageSlack(`user:${id}`, PAIRING_APPROVED_MESSAGE, { token: tokenOverride });
			else await getSlackRuntime().channel.slack.sendMessageSlack(`user:${id}`, PAIRING_APPROVED_MESSAGE);
		}
	},
	allowlist: {
		supportsScope: ({ scope }) => scope === "dm",
		readConfig: ({ cfg, accountId }) => readSlackAllowlistConfig(resolveSlackAccount({
			cfg,
			accountId
		})),
		resolveNames: async ({ cfg, accountId, entries }) => await resolveSlackAllowlistNames({
			cfg,
			accountId,
			entries
		}),
		applyConfigEdit: buildAccountScopedAllowlistConfigEditor({
			channelId: "slack",
			normalize: ({ cfg, accountId, values }) => slackConfigAccessors.formatAllowFrom({
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
				channelKey: "slack",
				accountId,
				fallbackAccountId: account.accountId ?? "default",
				policy: account.dm?.policy,
				allowFrom: account.dm?.allowFrom ?? [],
				allowFromPathSuffix: "dm.",
				normalizeEntry: (raw) => raw.replace(/^(slack|user):/i, "")
			});
		},
		collectWarnings: ({ account, cfg }) => {
			const channelAllowlistConfigured = Boolean(account.config.channels) && Object.keys(account.config.channels ?? {}).length > 0;
			return collectOpenProviderGroupPolicyWarnings({
				cfg,
				providerConfigPresent: cfg.channels?.slack !== void 0,
				configuredGroupPolicy: account.config.groupPolicy,
				collect: (groupPolicy) => collectOpenGroupPolicyConfiguredRouteWarnings({
					groupPolicy,
					routeAllowlistConfigured: channelAllowlistConfigured,
					configureRouteAllowlist: {
						surface: "Slack channels",
						openScope: "any channel not explicitly denied",
						groupPolicyPath: "channels.slack.groupPolicy",
						routeAllowlistPath: "channels.slack.channels"
					},
					missingRouteAllowlist: {
						surface: "Slack channels",
						openBehavior: "with no channel allowlist; any channel can trigger (mention-gated)",
						remediation: "Set channels.slack.groupPolicy=\"allowlist\" and configure channels.slack.channels"
					}
				})
			});
		}
	},
	groups: {
		resolveRequireMention: resolveSlackGroupRequireMention,
		resolveToolPolicy: resolveSlackGroupToolPolicy
	},
	threading: {
		resolveReplyToMode: ({ cfg, accountId, chatType }) => resolveSlackReplyToMode(resolveSlackAccount({
			cfg,
			accountId
		}), chatType),
		allowExplicitReplyTagsWhenOff: false,
		buildToolContext: (params) => buildSlackThreadingToolContext(params),
		resolveAutoThreadId: ({ cfg, accountId, to, toolContext, replyToId }) => replyToId ? void 0 : resolveSlackAutoThreadId({
			cfg,
			accountId,
			to,
			toolContext
		}),
		resolveReplyTransport: ({ threadId, replyToId }) => ({
			replyToId: replyToId ?? (threadId != null && threadId !== "" ? String(threadId) : void 0),
			threadId: null
		})
	},
	messaging: {
		normalizeTarget: normalizeSlackMessagingTarget,
		parseExplicitTarget: ({ raw }) => parseSlackExplicitTarget(raw),
		inferTargetChatType: ({ to }) => parseSlackExplicitTarget(to)?.chatType,
		resolveOutboundSessionRoute: async (params) => await resolveSlackOutboundSessionRoute(params),
		enableInteractiveReplies: ({ cfg, accountId }) => isSlackInteractiveRepliesEnabled({
			cfg,
			accountId
		}),
		hasStructuredReplyPayload: ({ payload }) => {
			const slackData = payload.channelData?.slack;
			if (!slackData || typeof slackData !== "object" || Array.isArray(slackData)) return false;
			try {
				return Boolean(parseSlackBlocksInput(slackData.blocks)?.length);
			} catch {
				return false;
			}
		},
		targetResolver: {
			looksLikeId: looksLikeSlackTargetId,
			hint: "<channelId|user:ID|channel:ID>"
		}
	},
	directory: {
		self: async () => null,
		listPeers: async (params) => listSlackDirectoryPeersFromConfig(params),
		listGroups: async (params) => listSlackDirectoryGroupsFromConfig(params),
		listPeersLive: async (params) => getSlackRuntime().channel.slack.listDirectoryPeersLive(params),
		listGroupsLive: async (params) => getSlackRuntime().channel.slack.listDirectoryGroupsLive(params)
	},
	resolver: { resolveTargets: async ({ cfg, accountId, inputs, kind }) => {
		const toResolvedTarget = (entry, note) => ({
			input: entry.input,
			resolved: entry.resolved,
			id: entry.id,
			name: entry.name,
			note
		});
		const account = resolveSlackAccount({
			cfg,
			accountId
		});
		const token = account.config.userToken?.trim() || account.botToken?.trim();
		if (!token) return inputs.map((input) => ({
			input,
			resolved: false,
			note: "missing Slack token"
		}));
		if (kind === "group") return (await getSlackRuntime().channel.slack.resolveChannelAllowlist({
			token,
			entries: inputs
		})).map((entry) => toResolvedTarget(entry, entry.archived ? "archived" : void 0));
		return (await getSlackRuntime().channel.slack.resolveUserAllowlist({
			token,
			entries: inputs
		})).map((entry) => toResolvedTarget(entry, entry.note));
	} },
	actions: createSlackActions(SLACK_CHANNEL, { invoke: async (action, cfg, toolContext) => await getSlackRuntime().channel.slack.handleSlackAction(action, cfg, toolContext) }),
	setup: slackSetupAdapter,
	outbound: {
		deliveryMode: "direct",
		chunker: null,
		textChunkLimit: 4e3,
		sendText: async ({ to, text, accountId, deps, replyToId, threadId, cfg }) => {
			const { send, threadTsValue, tokenOverride } = resolveSlackSendContext({
				cfg,
				accountId: accountId ?? void 0,
				deps,
				replyToId,
				threadId
			});
			return {
				channel: "slack",
				...await send(to, text, {
					cfg,
					threadTs: threadTsValue != null ? String(threadTsValue) : void 0,
					accountId: accountId ?? void 0,
					...tokenOverride ? { token: tokenOverride } : {}
				})
			};
		},
		sendMedia: async ({ to, text, mediaUrl, mediaLocalRoots, accountId, deps, replyToId, threadId, cfg }) => {
			const { send, threadTsValue, tokenOverride } = resolveSlackSendContext({
				cfg,
				accountId: accountId ?? void 0,
				deps,
				replyToId,
				threadId
			});
			return {
				channel: "slack",
				...await send(to, text, {
					cfg,
					mediaUrl,
					mediaLocalRoots,
					threadTs: threadTsValue != null ? String(threadTsValue) : void 0,
					accountId: accountId ?? void 0,
					...tokenOverride ? { token: tokenOverride } : {}
				})
			};
		}
	},
	status: {
		defaultRuntime: {
			accountId: DEFAULT_ACCOUNT_ID,
			running: false,
			lastStartAt: null,
			lastStopAt: null,
			lastError: null
		},
		buildChannelSummary: ({ snapshot }) => buildPassiveProbedChannelStatusSummary(snapshot, {
			botTokenSource: snapshot.botTokenSource ?? "none",
			appTokenSource: snapshot.appTokenSource ?? "none"
		}),
		probeAccount: async ({ account, timeoutMs }) => {
			const token = account.botToken?.trim();
			if (!token) return {
				ok: false,
				error: "missing token"
			};
			return await getSlackRuntime().channel.slack.probeSlack(token, timeoutMs);
		},
		formatCapabilitiesProbe: ({ probe }) => {
			const slackProbe = probe;
			const lines = [];
			if (slackProbe?.bot?.name) lines.push({ text: `Bot: @${slackProbe.bot.name}` });
			if (slackProbe?.team?.name || slackProbe?.team?.id) {
				const id = slackProbe.team?.id ? ` (${slackProbe.team.id})` : "";
				lines.push({ text: `Team: ${slackProbe.team?.name ?? "unknown"}${id}` });
			}
			return lines;
		},
		buildCapabilitiesDiagnostics: async ({ account, timeoutMs }) => {
			const lines = [];
			const details = {};
			const botToken = account.botToken?.trim();
			const userToken = account.config.userToken?.trim();
			const botScopes = botToken ? await fetchSlackScopes(botToken, timeoutMs) : {
				ok: false,
				error: "Slack bot token missing."
			};
			lines.push(formatSlackScopeDiagnostic({
				tokenType: "bot",
				result: botScopes
			}));
			details.botScopes = botScopes;
			if (userToken) {
				const userScopes = await fetchSlackScopes(userToken, timeoutMs);
				lines.push(formatSlackScopeDiagnostic({
					tokenType: "user",
					result: userScopes
				}));
				details.userScopes = userScopes;
			}
			return {
				lines,
				details
			};
		},
		buildAccountSnapshot: ({ account, runtime, probe }) => {
			const configured = ((account.config.mode ?? "socket") === "http" ? resolveConfiguredFromRequiredCredentialStatuses(account, ["botTokenStatus", "signingSecretStatus"]) : resolveConfiguredFromRequiredCredentialStatuses(account, ["botTokenStatus", "appTokenStatus"])) ?? isSlackPluginAccountConfigured(account);
			return {
				...buildComputedAccountStatusSnapshot({
					accountId: account.accountId,
					name: account.name,
					enabled: account.enabled,
					configured,
					runtime,
					probe
				}),
				...projectCredentialSnapshotFields(account)
			};
		}
	},
	gateway: { startAccount: async (ctx) => {
		const account = ctx.account;
		const botToken = account.botToken?.trim();
		const appToken = account.appToken?.trim();
		ctx.log?.info(`[${account.accountId}] starting provider`);
		return getSlackRuntime().channel.slack.monitorSlackProvider({
			botToken: botToken ?? "",
			appToken: appToken ?? "",
			accountId: account.accountId,
			config: ctx.cfg,
			runtime: ctx.runtime,
			abortSignal: ctx.abortSignal,
			mediaMaxMb: account.config.mediaMaxMb,
			slashCommand: account.config.slashCommand,
			setStatus: ctx.setStatus,
			getStatus: ctx.getStatus
		});
	} }
};
//#endregion
export { setSlackRuntime as n, slackPlugin as t };
