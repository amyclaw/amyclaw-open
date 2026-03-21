import "./redact-fatrROh9.js";
import "./errors-DOJWZqNo.js";
import "./unhandled-rejections-BT0Rsc03.js";
import "./logger-ByBU4z1U.js";
import "./paths-1qR_mW4i.js";
import "./tmp-openclaw-dir-BDQ0wJ2G.js";
import "./theme-BSXzMzAA.js";
import "./globals-DqZvRoPX.js";
import "./subsystem-MGyxt_Bl.js";
import "./ansi-BPhP6LBZ.js";
import "./boolean-D8Ha5nYV.js";
import "./env-DlREndPb.js";
import "./warning-filter-Cg8_xqcp.js";
import "./utils-BMtC0Ocd.js";
import "./links-DA9sitJV.js";
import "./setup-binary-nB5GxsnS.js";
import { Hh as resolveFeishuAccount, Ih as createFeishuClient, Ph as probeFeishu } from "./auth-profiles-Bc6TPi0n.js";
import "./model-selection-DJOYg7Dx.js";
import "./agent-scope-B-OyGztR.js";
import "./boundary-file-read-Y1cMjPlu.js";
import "./logger-iZtdpoh6.js";
import "./exec-CwhzW0JB.js";
import "./workspace-Dns6NMt3.js";
import "./io-CezuVcrG.js";
import "./host-env-security-DnH8wzZ4.js";
import "./safe-text-BcUvBreN.js";
import "./version-BMIQmWNJ.js";
import "./env-substitution--sbeMYae.js";
import "./config-state-sYURQqD8.js";
import "./network-mode-nTYy2WxO.js";
import "./registry-jBzBWMf6.js";
import "./manifest-registry-BcOvH3_O.js";
import "./ip-w605xvSx.js";
import "./zod-schema.core-CWxzqcUs.js";
import "./config-CcaRAPg3.js";
import "./audit-fs-Cequ8jTw.js";
import "./resolve-D7R3Obgc.js";
import "./provider-web-search-DqPBRERs.js";
import "./text-runtime-Cv7IlZFR.js";
import "./workspace-dirs-B6rDmzuU.js";
import "./config-SJMQwqYd.js";
import "./tailnet-KyAU6tj_.js";
import "./net-B_Iq_SVP.js";
import "./credentials-B7GJXbww.js";
import "./routes-AlbnCYWi.js";
import "./frontmatter-BGJSb9Mh.js";
import "./env-overrides-SSye1Eey.js";
import "./path-alias-guards-B3ZKrId1.js";
import "./skills-D8mkwPU_.js";
import "./ports-D_2Jwnkx.js";
import "./ports-lsof-DiY6GaAf.js";
import "./ssh-tunnel-DFSJj-3E.js";
import "./image-ops-DM56IRtp.js";
import "./fs-safe-Ds1qsPxW.js";
import "./mime-_IkgFMS2.js";
import "./server-middleware-CsOOV2sU.js";
import "./message-channel-C4icaB2h.js";
import "./resolve-route-CUHslQlg.js";
import "./internal-hooks-CWvLyTiW.js";
import "./lazy-runtime-07jXxTa3.js";
import "./config-schema-GQ6uWjXe.js";
import "./method-scopes-BAswg77K.js";
import "./session-cost-usage-C3_3zEKV.js";
import "./paths-BumENdHQ.js";
import "./routing-3o2D0ix4.js";
import "./send-TDX_qI_x.js";
import "./node-resolve-DiVPimcG.js";
import "./provider-stream-DiwQl_xA.js";
import "./identity-file-B5i4_r6U.js";
import "./provider-models-Cym0TctV.js";
import "./secret-file-DRp-Ebe1.js";
import "./logging-BdFqMomc.js";
import "./runtime-env-CT-voxYE.js";
import "./registry-CeB-k--4.js";
import "./provider-onboard-dAr3NUh2.js";
import "./model-definitions-DwehIMlw.js";
import "./diagnostic-D8TBqX9f.js";
import "./message-hook-mappers-MHm61O7_.js";
import "./json-store-Ct34wStR.js";
import "./call-x5WvUEsz.js";
import "./multimodal-BWF8MRkz.js";
import "./memory-search-CHMV_-Bg.js";
import "./query-expansion-CHmqSE4l.js";
import "./search-manager-ByZ9OOyz.js";
import "./core-TgQ7U3Ou.js";
import "./issue-format-i6sEuV4a.js";
import "./logging-imcVaYUC.js";
import "./note-aKR6kEr4.js";
import "./state-paths-C7dX__ql.js";
import "./config-value-Cb6kcdav.js";
import "./command-secret-targets-Ow94fQb1.js";
import "./brave-wyq_csg5.js";
import "./provider-usage-La8jvEfN.js";
import "./perplexity-Cjiwa0zB.js";
import "./restart-stale-pids-OWmDUCi0.js";
import "./delivery-queue-BaPLohg3.js";
import "./pairing-token-sCwb75an.js";
import "./accounts-CXqzdDJl.js";
import "./process-runtime-CicRKAFe.js";
import "./audit-DTw2xid0.js";
import "./cli-runtime-DtIDS2w7.js";
import "./cli-utils-FHeUZLsT.js";
import "./help-format-1yV2Xzq7.js";
import "./progress-B4roBB_B.js";
import "./gateway-runtime-50-32dyb.js";
import { a as getChatInfo, i as removeReactionFeishu, n as addReactionFeishu, o as getChatMembers, r as listReactionsFeishu, s as getFeishuMemberInfo } from "./reactions-D-Jr4r59.js";
import { t as getFeishuRuntime } from "./runtime-BBTvy_Yh.js";
import { n as listFeishuDirectoryPeers, t as listFeishuDirectoryGroups } from "./directory.static-BlX--T0S.js";
import { C as sendMediaFeishu, a as sendCardFeishu, c as sendStructuredCardFeishu, n as getMessageFeishu, o as sendMarkdownCardFeishu, s as sendMessageFeishu, t as editMessageFeishu } from "./send-Bpozf-Un.js";
import path from "path";
import fs from "fs";
//#region extensions/feishu/src/directory.ts
async function listFeishuDirectoryPeersLive(params) {
	const account = resolveFeishuAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	if (!account.configured) return listFeishuDirectoryPeers(params);
	try {
		const client = createFeishuClient(account);
		const peers = [];
		const limit = params.limit ?? 50;
		const response = await client.contact.user.list({ params: { page_size: Math.min(limit, 50) } });
		if (response.code !== 0) throw new Error(response.msg || `code ${response.code}`);
		for (const user of response.data?.items ?? []) {
			if (user.open_id) {
				const q = params.query?.trim().toLowerCase() || "";
				const name = user.name || "";
				if (!q || user.open_id.toLowerCase().includes(q) || name.toLowerCase().includes(q)) peers.push({
					kind: "user",
					id: user.open_id,
					name: name || void 0
				});
			}
			if (peers.length >= limit) break;
		}
		return peers;
	} catch (err) {
		if (params.fallbackToStatic === false) throw err instanceof Error ? err : /* @__PURE__ */ new Error("Feishu live peer lookup failed");
		return listFeishuDirectoryPeers(params);
	}
}
async function listFeishuDirectoryGroupsLive(params) {
	const account = resolveFeishuAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	if (!account.configured) return listFeishuDirectoryGroups(params);
	try {
		const client = createFeishuClient(account);
		const groups = [];
		const limit = params.limit ?? 50;
		const response = await client.im.chat.list({ params: { page_size: Math.min(limit, 100) } });
		if (response.code !== 0) throw new Error(response.msg || `code ${response.code}`);
		for (const chat of response.data?.items ?? []) {
			if (chat.chat_id) {
				const q = params.query?.trim().toLowerCase() || "";
				const name = chat.name || "";
				if (!q || chat.chat_id.toLowerCase().includes(q) || name.toLowerCase().includes(q)) groups.push({
					kind: "group",
					id: chat.chat_id,
					name: name || void 0
				});
			}
			if (groups.length >= limit) break;
		}
		return groups;
	} catch (err) {
		if (params.fallbackToStatic === false) throw err instanceof Error ? err : /* @__PURE__ */ new Error("Feishu live group lookup failed");
		return listFeishuDirectoryGroups(params);
	}
}
//#endregion
//#region extensions/feishu/src/outbound.ts
function normalizePossibleLocalImagePath(text) {
	const raw = text?.trim();
	if (!raw) return null;
	if (/\s/.test(raw)) return null;
	if (/^(https?:\/\/|data:|file:\/\/)/i.test(raw)) return null;
	const ext = path.extname(raw).toLowerCase();
	if (![
		".jpg",
		".jpeg",
		".png",
		".gif",
		".webp",
		".bmp",
		".ico",
		".tiff"
	].includes(ext)) return null;
	if (!path.isAbsolute(raw)) return null;
	if (!fs.existsSync(raw)) return null;
	try {
		if (!fs.statSync(raw).isFile()) return null;
	} catch {
		return null;
	}
	return raw;
}
function shouldUseCard(text) {
	return /```[\s\S]*?```/.test(text) || /\|.+\|[\r\n]+\|[-:| ]+\|/.test(text);
}
function resolveReplyToMessageId(params) {
	const replyToId = params.replyToId?.trim();
	if (replyToId) return replyToId;
	if (params.threadId == null) return;
	return String(params.threadId).trim() || void 0;
}
async function sendOutboundText(params) {
	const { cfg, to, text, accountId, replyToMessageId } = params;
	const renderMode = resolveFeishuAccount({
		cfg,
		accountId
	}).config?.renderMode ?? "auto";
	if (renderMode === "card" || renderMode === "auto" && shouldUseCard(text)) return sendMarkdownCardFeishu({
		cfg,
		to,
		text,
		accountId,
		replyToMessageId
	});
	return sendMessageFeishu({
		cfg,
		to,
		text,
		accountId,
		replyToMessageId
	});
}
const feishuOutbound = {
	deliveryMode: "direct",
	chunker: (text, limit) => getFeishuRuntime().channel.text.chunkMarkdownText(text, limit),
	chunkerMode: "markdown",
	textChunkLimit: 4e3,
	sendText: async ({ cfg, to, text, accountId, replyToId, threadId, mediaLocalRoots, identity }) => {
		const replyToMessageId = resolveReplyToMessageId({
			replyToId,
			threadId
		});
		const localImagePath = normalizePossibleLocalImagePath(text);
		if (localImagePath) try {
			return {
				channel: "feishu",
				...await sendMediaFeishu({
					cfg,
					to,
					mediaUrl: localImagePath,
					accountId: accountId ?? void 0,
					replyToMessageId,
					mediaLocalRoots
				})
			};
		} catch (err) {
			console.error(`[feishu] local image path auto-send failed:`, err);
		}
		const renderMode = resolveFeishuAccount({
			cfg,
			accountId: accountId ?? void 0
		}).config?.renderMode ?? "auto";
		if (renderMode === "card" || renderMode === "auto" && shouldUseCard(text)) {
			const header = identity ? {
				title: identity.emoji ? `${identity.emoji} ${identity.name ?? ""}`.trim() : identity.name ?? "",
				template: "blue"
			} : void 0;
			return {
				channel: "feishu",
				...await sendStructuredCardFeishu({
					cfg,
					to,
					text,
					replyToMessageId,
					replyInThread: threadId != null && !replyToId,
					accountId: accountId ?? void 0,
					header: header?.title ? header : void 0
				})
			};
		}
		return {
			channel: "feishu",
			...await sendOutboundText({
				cfg,
				to,
				text,
				accountId: accountId ?? void 0,
				replyToMessageId
			})
		};
	},
	sendMedia: async ({ cfg, to, text, mediaUrl, accountId, mediaLocalRoots, replyToId, threadId }) => {
		const replyToMessageId = resolveReplyToMessageId({
			replyToId,
			threadId
		});
		if (text?.trim()) await sendOutboundText({
			cfg,
			to,
			text,
			accountId: accountId ?? void 0,
			replyToMessageId
		});
		if (mediaUrl) try {
			return {
				channel: "feishu",
				...await sendMediaFeishu({
					cfg,
					to,
					mediaUrl,
					accountId: accountId ?? void 0,
					mediaLocalRoots,
					replyToMessageId
				})
			};
		} catch (err) {
			console.error(`[feishu] sendMediaFeishu failed:`, err);
			return {
				channel: "feishu",
				...await sendOutboundText({
					cfg,
					to,
					text: `📎 ${mediaUrl}`,
					accountId: accountId ?? void 0,
					replyToMessageId
				})
			};
		}
		return {
			channel: "feishu",
			...await sendOutboundText({
				cfg,
				to,
				text: text ?? "",
				accountId: accountId ?? void 0,
				replyToMessageId
			})
		};
	}
};
//#endregion
//#region extensions/feishu/src/pins.ts
function assertFeishuPinApiSuccess(response, action) {
	if (response.code !== 0) throw new Error(`Feishu ${action} failed: ${response.msg || `code ${response.code}`}`);
}
function normalizePin(pin) {
	return {
		messageId: pin.message_id,
		chatId: pin.chat_id,
		operatorId: pin.operator_id,
		operatorIdType: pin.operator_id_type,
		createTime: pin.create_time
	};
}
async function createPinFeishu(params) {
	const account = resolveFeishuAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	if (!account.configured) throw new Error(`Feishu account "${account.accountId}" not configured`);
	const response = await createFeishuClient(account).im.pin.create({ data: { message_id: params.messageId } });
	assertFeishuPinApiSuccess(response, "pin create");
	return response.data?.pin ? normalizePin(response.data.pin) : null;
}
async function removePinFeishu(params) {
	const account = resolveFeishuAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	if (!account.configured) throw new Error(`Feishu account "${account.accountId}" not configured`);
	assertFeishuPinApiSuccess(await createFeishuClient(account).im.pin.delete({ path: { message_id: params.messageId } }), "pin delete");
}
async function listPinsFeishu(params) {
	const account = resolveFeishuAccount({
		cfg: params.cfg,
		accountId: params.accountId
	});
	if (!account.configured) throw new Error(`Feishu account "${account.accountId}" not configured`);
	const response = await createFeishuClient(account).im.pin.list({ params: {
		chat_id: params.chatId,
		...params.startTime ? { start_time: params.startTime } : {},
		...params.endTime ? { end_time: params.endTime } : {},
		...typeof params.pageSize === "number" ? { page_size: Math.max(1, Math.min(100, Math.floor(params.pageSize))) } : {},
		...params.pageToken ? { page_token: params.pageToken } : {}
	} });
	assertFeishuPinApiSuccess(response, "pin list");
	return {
		chatId: params.chatId,
		pins: (response.data?.items ?? []).map(normalizePin),
		hasMore: response.data?.has_more === true,
		pageToken: response.data?.page_token
	};
}
//#endregion
//#region extensions/feishu/src/channel.runtime.ts
const feishuChannelRuntime = {
	listFeishuDirectoryGroupsLive,
	listFeishuDirectoryPeersLive,
	feishuOutbound: { ...feishuOutbound },
	createPinFeishu,
	listPinsFeishu,
	removePinFeishu,
	probeFeishu,
	addReactionFeishu,
	listReactionsFeishu,
	removeReactionFeishu,
	getChatInfo,
	getChatMembers,
	getFeishuMemberInfo,
	editMessageFeishu,
	getMessageFeishu,
	sendCardFeishu,
	sendMessageFeishu
};
//#endregion
export { feishuChannelRuntime };
