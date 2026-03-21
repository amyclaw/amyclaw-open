import { Bo as parseIMessageTarget, Jo as resolveIMessageAccount, LT as collectAllowlistProviderRestrictSendersWarnings, XC as collectStatusIssuesFromLastError, br as resolveIMessageGroupRequireMention, kT as buildAccountScopedDmSecurityPolicy, mT as formatTrimmedAllowFromEntries, xr as resolveIMessageGroupToolPolicy, zo as normalizeIMessageHandle } from "./auth-profiles-Bc6TPi0n.js";
import { t as DEFAULT_ACCOUNT_ID } from "./account-id-O4Og6DrK.js";
import { a as buildOutboundBaseSessionKey } from "./core-TgQ7U3Ou.js";
import { n as normalizeIMessageMessagingTarget, t as looksLikeIMessageTargetId } from "./imessage-C1KJl--J.js";
import { t as buildAccountScopedAllowlistConfigEditor } from "./allowlist-config-edit-CzEoX8BU.js";
import { n as buildPassiveProbedChannelStatusSummary } from "./channel-status-summary-CqaCAvAP.js";
import { t as getIMessageRuntime } from "./runtime-DzermfDh.js";
import { a as imessageSetupAdapter } from "./setup-core-FmBcvIJS.js";
import { n as imessageSetupWizard, t as createIMessagePluginBase } from "./shared-DbipMvv6.js";
//#region extensions/imessage/src/channel.ts
let imessageChannelRuntimePromise = null;
async function loadIMessageChannelRuntime() {
	imessageChannelRuntimePromise ??= import("./channel.runtime-CFxVEn1j.js");
	return imessageChannelRuntimePromise;
}
function buildIMessageBaseSessionKey(params) {
	return buildOutboundBaseSessionKey({
		...params,
		channel: "imessage"
	});
}
function resolveIMessageOutboundSessionRoute(params) {
	const parsed = parseIMessageTarget(params.target);
	if (parsed.kind === "handle") {
		const handle = normalizeIMessageHandle(parsed.to);
		if (!handle) return null;
		const peer = {
			kind: "direct",
			id: handle
		};
		const baseSessionKey = buildIMessageBaseSessionKey({
			cfg: params.cfg,
			agentId: params.agentId,
			accountId: params.accountId,
			peer
		});
		return {
			sessionKey: baseSessionKey,
			baseSessionKey,
			peer,
			chatType: "direct",
			from: `imessage:${handle}`,
			to: `imessage:${handle}`
		};
	}
	const peerId = parsed.kind === "chat_id" ? String(parsed.chatId) : parsed.kind === "chat_guid" ? parsed.chatGuid : parsed.chatIdentifier;
	if (!peerId) return null;
	const peer = {
		kind: "group",
		id: peerId
	};
	const baseSessionKey = buildIMessageBaseSessionKey({
		cfg: params.cfg,
		agentId: params.agentId,
		accountId: params.accountId,
		peer
	});
	const toPrefix = parsed.kind === "chat_id" ? "chat_id" : parsed.kind === "chat_guid" ? "chat_guid" : "chat_identifier";
	return {
		sessionKey: baseSessionKey,
		baseSessionKey,
		peer,
		chatType: "group",
		from: `imessage:group:${peerId}`,
		to: `${toPrefix}:${peerId}`
	};
}
const imessagePlugin = {
	...createIMessagePluginBase({
		setupWizard: imessageSetupWizard,
		setup: imessageSetupAdapter
	}),
	pairing: {
		idLabel: "imessageSenderId",
		notifyApproval: async ({ id }) => await (await loadIMessageChannelRuntime()).notifyIMessageApproval(id)
	},
	allowlist: {
		supportsScope: ({ scope }) => scope === "dm" || scope === "group" || scope === "all",
		readConfig: ({ cfg, accountId }) => {
			const account = resolveIMessageAccount({
				cfg,
				accountId
			});
			return {
				dmAllowFrom: (account.config.allowFrom ?? []).map(String),
				groupAllowFrom: (account.config.groupAllowFrom ?? []).map(String),
				dmPolicy: account.config.dmPolicy,
				groupPolicy: account.config.groupPolicy
			};
		},
		applyConfigEdit: buildAccountScopedAllowlistConfigEditor({
			channelId: "imessage",
			normalize: ({ values }) => formatTrimmedAllowFromEntries(values),
			resolvePaths: (scope) => ({
				readPaths: [[scope === "dm" ? "allowFrom" : "groupAllowFrom"]],
				writePath: [scope === "dm" ? "allowFrom" : "groupAllowFrom"]
			})
		})
	},
	security: {
		resolveDmPolicy: ({ cfg, accountId, account }) => {
			return buildAccountScopedDmSecurityPolicy({
				cfg,
				channelKey: "imessage",
				accountId,
				fallbackAccountId: account.accountId ?? "default",
				policy: account.config.dmPolicy,
				allowFrom: account.config.allowFrom ?? [],
				policyPathSuffix: "dmPolicy"
			});
		},
		collectWarnings: ({ account, cfg }) => {
			return collectAllowlistProviderRestrictSendersWarnings({
				cfg,
				providerConfigPresent: cfg.channels?.imessage !== void 0,
				configuredGroupPolicy: account.config.groupPolicy,
				surface: "iMessage groups",
				openScope: "any member",
				groupPolicyPath: "channels.imessage.groupPolicy",
				groupAllowFromPath: "channels.imessage.groupAllowFrom",
				mentionGated: false
			});
		}
	},
	groups: {
		resolveRequireMention: resolveIMessageGroupRequireMention,
		resolveToolPolicy: resolveIMessageGroupToolPolicy
	},
	messaging: {
		normalizeTarget: normalizeIMessageMessagingTarget,
		resolveOutboundSessionRoute: (params) => resolveIMessageOutboundSessionRoute(params),
		targetResolver: {
			looksLikeId: looksLikeIMessageTargetId,
			hint: "<handle|chat_id:ID>"
		}
	},
	outbound: {
		deliveryMode: "direct",
		chunker: (text, limit) => getIMessageRuntime().channel.text.chunkText(text, limit),
		chunkerMode: "text",
		textChunkLimit: 4e3,
		sendText: async ({ cfg, to, text, accountId, deps, replyToId }) => {
			return {
				channel: "imessage",
				...await (await loadIMessageChannelRuntime()).sendIMessageOutbound({
					cfg,
					to,
					text,
					accountId: accountId ?? void 0,
					deps,
					replyToId: replyToId ?? void 0
				})
			};
		},
		sendMedia: async ({ cfg, to, text, mediaUrl, mediaLocalRoots, accountId, deps, replyToId }) => {
			return {
				channel: "imessage",
				...await (await loadIMessageChannelRuntime()).sendIMessageOutbound({
					cfg,
					to,
					text,
					mediaUrl,
					mediaLocalRoots,
					accountId: accountId ?? void 0,
					deps,
					replyToId: replyToId ?? void 0
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
			lastError: null,
			cliPath: null,
			dbPath: null
		},
		collectStatusIssues: (accounts) => collectStatusIssuesFromLastError("imessage", accounts),
		buildChannelSummary: ({ snapshot }) => buildPassiveProbedChannelStatusSummary(snapshot, {
			cliPath: snapshot.cliPath ?? null,
			dbPath: snapshot.dbPath ?? null
		}),
		probeAccount: async ({ timeoutMs }) => await (await loadIMessageChannelRuntime()).probeIMessageAccount(timeoutMs),
		buildAccountSnapshot: ({ account, runtime, probe }) => ({
			accountId: account.accountId,
			name: account.name,
			enabled: account.enabled,
			configured: account.configured,
			running: runtime?.running ?? false,
			lastStartAt: runtime?.lastStartAt ?? null,
			lastStopAt: runtime?.lastStopAt ?? null,
			lastError: runtime?.lastError ?? null,
			cliPath: runtime?.cliPath ?? account.config.cliPath ?? null,
			dbPath: runtime?.dbPath ?? account.config.dbPath ?? null,
			probe,
			lastInboundAt: runtime?.lastInboundAt ?? null,
			lastOutboundAt: runtime?.lastOutboundAt ?? null
		}),
		resolveAccountState: ({ enabled }) => enabled ? "enabled" : "disabled"
	},
	gateway: { startAccount: async (ctx) => await (await loadIMessageChannelRuntime()).startIMessageGatewayAccount(ctx) }
};
//#endregion
export { imessagePlugin as t };
