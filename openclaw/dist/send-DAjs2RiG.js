import { n as normalizeAccountId, t as DEFAULT_ACCOUNT_ID } from "./account-id-O4Og6DrK.js";
import { t as KeyedAsyncQueue } from "./keyed-async-queue-BGC0Vi7n.js";
import { _ as isBunRuntime, f as startMatrixClientWithGrace, h as getMatrixLogService, m as resolveMatrixAuth, p as createMatrixClient, u as resolveSharedMatrixClient } from "./matrix-B69n40Oi.js";
import { s as getMatrixRuntime } from "./credentials-CgJiOMDt.js";
import MarkdownIt from "markdown-it";
//#region extensions/matrix/src/matrix/poll-types.ts
const M_POLL_START = "m.poll.start";
const POLL_START_TYPES = [M_POLL_START, "org.matrix.msc3381.poll.start"];
function isPollStartType(eventType) {
	return POLL_START_TYPES.includes(eventType);
}
function getTextContent(text) {
	if (!text) return "";
	return text["m.text"] ?? text["org.matrix.msc1767.text"] ?? text.body ?? "";
}
function parsePollStartContent(content) {
	const poll = content["m.poll.start"] ?? content["org.matrix.msc3381.poll.start"] ?? content["m.poll"];
	if (!poll) return null;
	const question = getTextContent(poll.question);
	if (!question) return null;
	return {
		eventId: "",
		roomId: "",
		sender: "",
		senderName: "",
		question,
		answers: poll.answers.map((answer) => getTextContent(answer)).filter((a) => a.trim().length > 0),
		kind: poll.kind ?? "m.poll.disclosed",
		maxSelections: poll.max_selections ?? 1
	};
}
function formatPollAsText(summary) {
	return [
		"[Poll]",
		summary.question,
		"",
		...summary.answers.map((answer, idx) => `${idx + 1}. ${answer}`)
	].join("\n");
}
function buildTextContent$1(body) {
	return {
		"m.text": body,
		"org.matrix.msc1767.text": body
	};
}
function buildPollFallbackText(question, answers) {
	if (answers.length === 0) return question;
	return `${question}\n${answers.map((answer, idx) => `${idx + 1}. ${answer}`).join("\n")}`;
}
function buildPollStartContent(poll) {
	const question = poll.question.trim();
	const answers = poll.options.map((option) => option.trim()).filter((option) => option.length > 0).map((option, idx) => ({
		id: `answer${idx + 1}`,
		...buildTextContent$1(option)
	}));
	const isMultiple = (poll.maxSelections ?? 1) > 1;
	const maxSelections = isMultiple ? Math.max(1, answers.length) : 1;
	const fallbackText = buildPollFallbackText(question, answers.map((answer) => getTextContent(answer)));
	return {
		[M_POLL_START]: {
			question: buildTextContent$1(question),
			kind: isMultiple ? "m.poll.undisclosed" : "m.poll.disclosed",
			max_selections: maxSelections,
			answers
		},
		"m.text": fallbackText,
		"org.matrix.msc1767.text": fallbackText
	};
}
const roomQueues = new KeyedAsyncQueue();
function enqueueSend(roomId, fn, options) {
	const gapMs = options?.gapMs ?? 150;
	const delayFn = options?.delayFn ?? delay;
	return roomQueues.enqueue(roomId, async () => {
		await delayFn(gapMs);
		return await fn();
	});
}
function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
//#endregion
//#region extensions/matrix/src/matrix/active-client.ts
const activeClients = /* @__PURE__ */ new Map();
function setActiveMatrixClient(client, accountId) {
	const key = normalizeAccountId(accountId);
	if (client) activeClients.set(key, client);
	else activeClients.delete(key);
}
function getActiveMatrixClient(accountId) {
	const key = normalizeAccountId(accountId);
	return activeClients.get(key) ?? null;
}
function getAnyActiveMatrixClient() {
	const first = activeClients.values().next();
	return first.done ? null : first.value;
}
//#endregion
//#region extensions/matrix/src/matrix/client-bootstrap.ts
async function createPreparedMatrixClient(opts) {
	const client = await createMatrixClient({
		homeserver: opts.auth.homeserver,
		userId: opts.auth.userId,
		accessToken: opts.auth.accessToken,
		encryption: opts.auth.encryption,
		localTimeoutMs: opts.timeoutMs,
		accountId: opts.accountId
	});
	if (opts.auth.encryption && client.crypto) try {
		const joinedRooms = await client.getJoinedRooms();
		await client.crypto.prepare(joinedRooms);
	} catch {}
	await startMatrixClientWithGrace({
		client,
		onError: (err) => {
			getMatrixLogService().error("MatrixClientBootstrap", "client.start() error:", err);
		}
	});
	return client;
}
//#endregion
//#region extensions/matrix/src/matrix/send/client.ts
const getCore$3 = () => getMatrixRuntime();
function ensureNodeRuntime() {
	if (isBunRuntime()) throw new Error("Matrix support requires Node (bun runtime not supported)");
}
/** Look up account config with case-insensitive key fallback. */
function findAccountConfig(accounts, accountId) {
	if (!accounts) return void 0;
	const normalized = normalizeAccountId(accountId);
	if (accounts[normalized]) return accounts[normalized];
	for (const key of Object.keys(accounts)) if (normalizeAccountId(key) === normalized) return accounts[key];
}
function resolveMediaMaxBytes(accountId, cfg) {
	const resolvedCfg = cfg ?? getCore$3().config.loadConfig();
	const accountConfig = findAccountConfig(resolvedCfg.channels?.matrix?.accounts, accountId ?? "");
	if (typeof accountConfig?.mediaMaxMb === "number") return accountConfig.mediaMaxMb * 1024 * 1024;
	if (typeof resolvedCfg.channels?.matrix?.mediaMaxMb === "number") return resolvedCfg.channels.matrix.mediaMaxMb * 1024 * 1024;
}
async function resolveMatrixClient(opts) {
	ensureNodeRuntime();
	if (opts.client) return {
		client: opts.client,
		stopOnDone: false
	};
	const accountId = typeof opts.accountId === "string" && opts.accountId.trim().length > 0 ? normalizeAccountId(opts.accountId) : void 0;
	const active = getActiveMatrixClient(accountId);
	if (active) return {
		client: active,
		stopOnDone: false
	};
	if (!accountId) {
		const defaultClient = getActiveMatrixClient(DEFAULT_ACCOUNT_ID);
		if (defaultClient) return {
			client: defaultClient,
			stopOnDone: false
		};
		const anyActive = getAnyActiveMatrixClient();
		if (anyActive) return {
			client: anyActive,
			stopOnDone: false
		};
	}
	if (Boolean(process.env.OPENCLAW_GATEWAY_PORT)) return {
		client: await resolveSharedMatrixClient({
			timeoutMs: opts.timeoutMs,
			accountId,
			cfg: opts.cfg
		}),
		stopOnDone: false
	};
	return {
		client: await createPreparedMatrixClient({
			auth: await resolveMatrixAuth({
				accountId,
				cfg: opts.cfg
			}),
			timeoutMs: opts.timeoutMs,
			accountId
		}),
		stopOnDone: true
	};
}
//#endregion
//#region extensions/matrix/src/matrix/format.ts
const md = new MarkdownIt({
	html: false,
	linkify: true,
	breaks: true,
	typographer: false
});
md.enable("strikethrough");
const { escapeHtml } = md.utils;
md.renderer.rules.image = (tokens, idx) => escapeHtml(tokens[idx]?.content ?? "");
md.renderer.rules.html_block = (tokens, idx) => escapeHtml(tokens[idx]?.content ?? "");
md.renderer.rules.html_inline = (tokens, idx) => escapeHtml(tokens[idx]?.content ?? "");
function markdownToMatrixHtml(markdown) {
	return md.render(markdown ?? "").trimEnd();
}
//#endregion
//#region extensions/matrix/src/matrix/send/types.ts
const MsgType = {
	Text: "m.text",
	Image: "m.image",
	Audio: "m.audio",
	Video: "m.video",
	File: "m.file",
	Notice: "m.notice"
};
const RelationType = {
	Annotation: "m.annotation",
	Replace: "m.replace",
	Thread: "m.thread"
};
const EventType = {
	Direct: "m.direct",
	Reaction: "m.reaction",
	RoomMessage: "m.room.message"
};
//#endregion
//#region extensions/matrix/src/matrix/send/formatting.ts
const getCore$2 = () => getMatrixRuntime();
function buildTextContent(body, relation) {
	const content = relation ? {
		msgtype: MsgType.Text,
		body,
		"m.relates_to": relation
	} : {
		msgtype: MsgType.Text,
		body
	};
	applyMatrixFormatting(content, body);
	return content;
}
function applyMatrixFormatting(content, body) {
	const formatted = markdownToMatrixHtml(body ?? "");
	if (!formatted) return;
	content.format = "org.matrix.custom.html";
	content.formatted_body = formatted;
}
function buildReplyRelation(replyToId) {
	const trimmed = replyToId?.trim();
	if (!trimmed) return;
	return { "m.in_reply_to": { event_id: trimmed } };
}
function buildThreadRelation(threadId, replyToId) {
	const trimmed = threadId.trim();
	return {
		rel_type: RelationType.Thread,
		event_id: trimmed,
		is_falling_back: true,
		"m.in_reply_to": { event_id: replyToId?.trim() || trimmed }
	};
}
function resolveMatrixMsgType(contentType, _fileName) {
	switch (getCore$2().media.mediaKindFromMime(contentType ?? "")) {
		case "image": return MsgType.Image;
		case "audio": return MsgType.Audio;
		case "video": return MsgType.Video;
		default: return MsgType.File;
	}
}
function resolveMatrixVoiceDecision(opts) {
	if (!opts.wantsVoice) return { useVoice: false };
	if (isMatrixVoiceCompatibleAudio(opts)) return { useVoice: true };
	return { useVoice: false };
}
function isMatrixVoiceCompatibleAudio(opts) {
	return getCore$2().media.isVoiceCompatibleAudio({
		contentType: opts.contentType,
		fileName: opts.fileName
	});
}
//#endregion
//#region extensions/matrix/src/matrix/send/media.ts
const getCore$1 = () => getMatrixRuntime();
function buildMatrixMediaInfo(params) {
	const base = {};
	if (Number.isFinite(params.size)) base.size = params.size;
	if (params.mimetype) base.mimetype = params.mimetype;
	if (params.imageInfo) {
		const dimensional = {
			...base,
			...params.imageInfo
		};
		if (typeof params.durationMs === "number") return {
			...dimensional,
			duration: params.durationMs
		};
		return dimensional;
	}
	if (typeof params.durationMs === "number") return {
		...base,
		duration: params.durationMs
	};
	if (Object.keys(base).length === 0) return;
	return base;
}
function buildMediaContent(params) {
	const info = buildMatrixMediaInfo({
		size: params.size,
		mimetype: params.mimetype,
		durationMs: params.durationMs,
		imageInfo: params.imageInfo
	});
	const base = {
		msgtype: params.msgtype,
		body: params.body,
		filename: params.filename,
		info: info ?? void 0
	};
	if (!params.file && params.url) base.url = params.url;
	if (params.file) base.file = params.file;
	if (params.isVoice) {
		base["org.matrix.msc3245.voice"] = {};
		if (typeof params.durationMs === "number") base["org.matrix.msc1767.audio"] = { duration: params.durationMs };
	}
	if (params.relation) base["m.relates_to"] = params.relation;
	applyMatrixFormatting(base, params.body);
	return base;
}
const THUMBNAIL_MAX_SIDE = 800;
const THUMBNAIL_QUALITY = 80;
async function prepareImageInfo(params) {
	const meta = await getCore$1().media.getImageMetadata(params.buffer).catch(() => null);
	if (!meta) return;
	const imageInfo = {
		w: meta.width,
		h: meta.height
	};
	if (Math.max(meta.width, meta.height) > THUMBNAIL_MAX_SIDE) try {
		const thumbBuffer = await getCore$1().media.resizeToJpeg({
			buffer: params.buffer,
			maxSide: THUMBNAIL_MAX_SIDE,
			quality: THUMBNAIL_QUALITY,
			withoutEnlargement: true
		});
		const thumbMeta = await getCore$1().media.getImageMetadata(thumbBuffer).catch(() => null);
		imageInfo.thumbnail_url = await params.client.uploadContent(thumbBuffer, "image/jpeg", "thumbnail.jpg");
		if (thumbMeta) imageInfo.thumbnail_info = {
			w: thumbMeta.width,
			h: thumbMeta.height,
			mimetype: "image/jpeg",
			size: thumbBuffer.byteLength
		};
	} catch {}
	return imageInfo;
}
async function resolveMediaDurationMs(params) {
	if (params.kind !== "audio" && params.kind !== "video") return;
	try {
		const { parseBuffer } = await import("./lib-5aKp1wZN.js");
		const fileInfo = params.contentType || params.fileName ? {
			mimeType: params.contentType,
			size: params.buffer.byteLength,
			path: params.fileName
		} : void 0;
		const durationSeconds = (await parseBuffer(params.buffer, fileInfo, {
			duration: true,
			skipCovers: true
		})).format.duration;
		if (typeof durationSeconds === "number" && Number.isFinite(durationSeconds)) return Math.max(0, Math.round(durationSeconds * 1e3));
	} catch {}
}
async function uploadFile(client, file, params) {
	return await client.uploadContent(file, params.contentType, params.filename);
}
/**
* Upload media with optional encryption for E2EE rooms.
*/
async function uploadMediaMaybeEncrypted(client, roomId, buffer, params) {
	if (client.crypto && await client.crypto.isRoomEncrypted(roomId) && client.crypto) {
		const encrypted = await client.crypto.encryptMedia(buffer);
		const mxc = await client.uploadContent(encrypted.buffer, params.contentType, params.filename);
		return {
			url: mxc,
			file: {
				url: mxc,
				...encrypted.file
			}
		};
	}
	return { url: await uploadFile(client, buffer, params) };
}
//#endregion
//#region extensions/matrix/src/matrix/send/targets.ts
function normalizeTarget(raw) {
	const trimmed = raw.trim();
	if (!trimmed) throw new Error("Matrix target is required (room:<id> or #alias)");
	return trimmed;
}
function normalizeThreadId(raw) {
	if (raw === void 0 || raw === null) return null;
	const trimmed = String(raw).trim();
	return trimmed ? trimmed : null;
}
const MAX_DIRECT_ROOM_CACHE_SIZE = 1024;
const directRoomCache = /* @__PURE__ */ new Map();
function setDirectRoomCached(key, value) {
	directRoomCache.set(key, value);
	if (directRoomCache.size > MAX_DIRECT_ROOM_CACHE_SIZE) {
		const oldest = directRoomCache.keys().next().value;
		if (oldest !== void 0) directRoomCache.delete(oldest);
	}
}
async function persistDirectRoom(client, userId, roomId) {
	let directContent = null;
	try {
		directContent = await client.getAccountData(EventType.Direct);
	} catch {}
	const existing = directContent && !Array.isArray(directContent) ? directContent : {};
	const current = Array.isArray(existing[userId]) ? existing[userId] : [];
	if (current[0] === roomId) return;
	const next = [roomId, ...current.filter((id) => id !== roomId)];
	try {
		await client.setAccountData(EventType.Direct, {
			...existing,
			[userId]: next
		});
	} catch {}
}
async function resolveDirectRoomId(client, userId) {
	const trimmed = userId.trim();
	if (!trimmed.startsWith("@")) throw new Error(`Matrix user IDs must be fully qualified (got "${trimmed}")`);
	const cached = directRoomCache.get(trimmed);
	if (cached) return cached;
	try {
		const directContent = await client.getAccountData(EventType.Direct);
		const list = Array.isArray(directContent?.[trimmed]) ? directContent[trimmed] : [];
		if (list && list.length > 0) {
			setDirectRoomCached(trimmed, list[0]);
			return list[0];
		}
	} catch {}
	let fallbackRoom = null;
	try {
		const rooms = await client.getJoinedRooms();
		for (const roomId of rooms) {
			let members;
			try {
				members = await client.getJoinedRoomMembers(roomId);
			} catch {
				continue;
			}
			if (!members.includes(trimmed)) continue;
			if (members.length === 2) {
				setDirectRoomCached(trimmed, roomId);
				await persistDirectRoom(client, trimmed, roomId);
				return roomId;
			}
			if (!fallbackRoom) fallbackRoom = roomId;
		}
	} catch {}
	if (fallbackRoom) {
		setDirectRoomCached(trimmed, fallbackRoom);
		await persistDirectRoom(client, trimmed, fallbackRoom);
		return fallbackRoom;
	}
	throw new Error(`No direct room found for ${trimmed} (m.direct missing)`);
}
async function resolveMatrixRoomId(client, raw) {
	const target = normalizeTarget(raw);
	const lowered = target.toLowerCase();
	if (lowered.startsWith("matrix:")) return await resolveMatrixRoomId(client, target.slice(7));
	if (lowered.startsWith("room:")) return await resolveMatrixRoomId(client, target.slice(5));
	if (lowered.startsWith("channel:")) return await resolveMatrixRoomId(client, target.slice(8));
	if (lowered.startsWith("user:")) return await resolveDirectRoomId(client, target.slice(5));
	if (target.startsWith("@")) return await resolveDirectRoomId(client, target);
	if (target.startsWith("#")) {
		const resolved = await client.resolveRoom(target);
		if (!resolved) throw new Error(`Matrix alias ${target} could not be resolved`);
		return resolved;
	}
	return target;
}
//#endregion
//#region extensions/matrix/src/matrix/send.ts
const MATRIX_TEXT_LIMIT = 4e3;
const getCore = () => getMatrixRuntime();
async function sendMessageMatrix(to, message, opts = {}) {
	const trimmedMessage = message?.trim() ?? "";
	if (!trimmedMessage && !opts.mediaUrl) throw new Error("Matrix send requires text or media");
	const { client, stopOnDone } = await resolveMatrixClient({
		client: opts.client,
		timeoutMs: opts.timeoutMs,
		accountId: opts.accountId,
		cfg: opts.cfg
	});
	const cfg = opts.cfg ?? getCore().config.loadConfig();
	try {
		const roomId = await resolveMatrixRoomId(client, to);
		return await enqueueSend(roomId, async () => {
			const tableMode = getCore().channel.text.resolveMarkdownTableMode({
				cfg,
				channel: "matrix",
				accountId: opts.accountId
			});
			const convertedMessage = getCore().channel.text.convertMarkdownTables(trimmedMessage, tableMode);
			const textLimit = getCore().channel.text.resolveTextChunkLimit(cfg, "matrix");
			const chunkLimit = Math.min(textLimit, MATRIX_TEXT_LIMIT);
			const chunkMode = getCore().channel.text.resolveChunkMode(cfg, "matrix", opts.accountId);
			const chunks = getCore().channel.text.chunkMarkdownTextWithMode(convertedMessage, chunkLimit, chunkMode);
			const threadId = normalizeThreadId(opts.threadId);
			const relation = threadId ? buildThreadRelation(threadId, opts.replyToId) : buildReplyRelation(opts.replyToId);
			const sendContent = async (content) => {
				return await client.sendMessage(roomId, content);
			};
			let lastMessageId = "";
			if (opts.mediaUrl) {
				const maxBytes = resolveMediaMaxBytes(opts.accountId, cfg);
				const media = await getCore().media.loadWebMedia(opts.mediaUrl, maxBytes);
				const uploaded = await uploadMediaMaybeEncrypted(client, roomId, media.buffer, {
					contentType: media.contentType,
					filename: media.fileName
				});
				const durationMs = await resolveMediaDurationMs({
					buffer: media.buffer,
					contentType: media.contentType,
					fileName: media.fileName,
					kind: media.kind ?? "unknown"
				});
				const baseMsgType = resolveMatrixMsgType(media.contentType, media.fileName);
				const { useVoice } = resolveMatrixVoiceDecision({
					wantsVoice: opts.audioAsVoice === true,
					contentType: media.contentType,
					fileName: media.fileName
				});
				const msgtype = useVoice ? MsgType.Audio : baseMsgType;
				const imageInfo = msgtype === MsgType.Image ? await prepareImageInfo({
					buffer: media.buffer,
					client
				}) : void 0;
				const [firstChunk, ...rest] = chunks;
				lastMessageId = await sendContent(buildMediaContent({
					msgtype,
					body: useVoice ? "Voice message" : firstChunk ?? media.fileName ?? "(file)",
					url: uploaded.url,
					file: uploaded.file,
					filename: media.fileName,
					mimetype: media.contentType,
					size: media.buffer.byteLength,
					durationMs,
					relation,
					isVoice: useVoice,
					imageInfo
				})) ?? lastMessageId;
				const textChunks = useVoice ? chunks : rest;
				const followupRelation = threadId ? relation : void 0;
				for (const chunk of textChunks) {
					const text = chunk.trim();
					if (!text) continue;
					lastMessageId = await sendContent(buildTextContent(text, followupRelation)) ?? lastMessageId;
				}
			} else for (const chunk of chunks.length ? chunks : [""]) {
				const text = chunk.trim();
				if (!text) continue;
				lastMessageId = await sendContent(buildTextContent(text, relation)) ?? lastMessageId;
			}
			return {
				messageId: lastMessageId || "unknown",
				roomId
			};
		});
	} finally {
		if (stopOnDone) client.stop();
	}
}
async function sendPollMatrix(to, poll, opts = {}) {
	if (!poll.question?.trim()) throw new Error("Matrix poll requires a question");
	if (!poll.options?.length) throw new Error("Matrix poll requires options");
	const { client, stopOnDone } = await resolveMatrixClient({
		client: opts.client,
		timeoutMs: opts.timeoutMs,
		accountId: opts.accountId,
		cfg: opts.cfg
	});
	try {
		const roomId = await resolveMatrixRoomId(client, to);
		const pollContent = buildPollStartContent(poll);
		const threadId = normalizeThreadId(opts.threadId);
		const pollPayload = threadId ? {
			...pollContent,
			"m.relates_to": buildThreadRelation(threadId)
		} : pollContent;
		return {
			eventId: await client.sendEvent(roomId, "m.poll.start", pollPayload) ?? "unknown",
			roomId
		};
	} finally {
		if (stopOnDone) client.stop();
	}
}
async function sendTypingMatrix(roomId, typing, timeoutMs, client) {
	const { client: resolved, stopOnDone } = await resolveMatrixClient({
		client,
		timeoutMs
	});
	try {
		const resolvedTimeoutMs = typeof timeoutMs === "number" ? timeoutMs : 3e4;
		await resolved.setTyping(roomId, typing, resolvedTimeoutMs);
	} finally {
		if (stopOnDone) resolved.stop();
	}
}
async function sendReadReceiptMatrix(roomId, eventId, client) {
	if (!eventId?.trim()) return;
	const { client: resolved, stopOnDone } = await resolveMatrixClient({ client });
	try {
		const resolvedRoom = await resolveMatrixRoomId(resolved, roomId);
		await resolved.sendReadReceipt(resolvedRoom, eventId.trim());
	} finally {
		if (stopOnDone) resolved.stop();
	}
}
async function reactMatrixMessage(roomId, messageId, emoji, client) {
	if (!emoji.trim()) throw new Error("Matrix reaction requires an emoji");
	const { client: resolved, stopOnDone } = await resolveMatrixClient({ client });
	try {
		const resolvedRoom = await resolveMatrixRoomId(resolved, roomId);
		const reaction = { "m.relates_to": {
			rel_type: RelationType.Annotation,
			event_id: messageId,
			key: emoji
		} };
		await resolved.sendEvent(resolvedRoom, EventType.Reaction, reaction);
	} finally {
		if (stopOnDone) resolved.stop();
	}
}
//#endregion
export { sendTypingMatrix as a, getActiveMatrixClient as c, isPollStartType as d, parsePollStartContent as f, sendReadReceiptMatrix as i, setActiveMatrixClient as l, sendMessageMatrix as n, resolveMatrixRoomId as o, sendPollMatrix as r, createPreparedMatrixClient as s, reactMatrixMessage as t, formatPollAsText as u };
