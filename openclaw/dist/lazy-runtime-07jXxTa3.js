import { h as resolveOAuthDir } from "./paths-1qR_mW4i.js";
import { l as escapeRegExp } from "./utils-BMtC0Ocd.js";
import { c as normalizeAgentId, l as normalizeMainKey } from "./session-key-DyhRsRh-.js";
import { t as DEFAULT_ACCOUNT_ID } from "./account-id-O4Og6DrK.js";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
//#region src/channels/config-presence.ts
const IGNORED_CHANNEL_CONFIG_KEYS = new Set(["defaults", "modelByChannel"]);
const CHANNEL_ENV_PREFIXES = [
	["BLUEBUBBLES_", "bluebubbles"],
	["DISCORD_", "discord"],
	["GOOGLECHAT_", "googlechat"],
	["IRC_", "irc"],
	["LINE_", "line"],
	["MATRIX_", "matrix"],
	["MSTEAMS_", "msteams"],
	["SIGNAL_", "signal"],
	["SLACK_", "slack"],
	["TELEGRAM_", "telegram"],
	["WHATSAPP_", "whatsapp"],
	["ZALOUSER_", "zalouser"],
	["ZALO_", "zalo"]
];
function hasNonEmptyString(value) {
	return typeof value === "string" && value.trim().length > 0;
}
function isRecord(value) {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function hasMeaningfulChannelConfig(value) {
	if (!isRecord(value)) return false;
	return Object.keys(value).some((key) => key !== "enabled");
}
function hasWhatsAppAuthState(env) {
	try {
		const oauthDir = resolveOAuthDir(env);
		const legacyCreds = path.join(oauthDir, "creds.json");
		if (fs.existsSync(legacyCreds)) return true;
		const accountsRoot = path.join(oauthDir, "whatsapp");
		const defaultCreds = path.join(accountsRoot, DEFAULT_ACCOUNT_ID, "creds.json");
		if (fs.existsSync(defaultCreds)) return true;
		return fs.readdirSync(accountsRoot, { withFileTypes: true }).some((entry) => {
			if (!entry.isDirectory()) return false;
			return fs.existsSync(path.join(accountsRoot, entry.name, "creds.json"));
		});
	} catch {
		return false;
	}
}
function listPotentialConfiguredChannelIds(cfg, env = process.env) {
	const configuredChannelIds = /* @__PURE__ */ new Set();
	const channels = isRecord(cfg.channels) ? cfg.channels : null;
	if (channels) for (const [key, value] of Object.entries(channels)) {
		if (IGNORED_CHANNEL_CONFIG_KEYS.has(key)) continue;
		if (hasMeaningfulChannelConfig(value)) configuredChannelIds.add(key);
	}
	for (const [key, value] of Object.entries(env)) {
		if (!hasNonEmptyString(value)) continue;
		for (const [prefix, channelId] of CHANNEL_ENV_PREFIXES) if (key.startsWith(prefix)) configuredChannelIds.add(channelId);
		if (key === "TELEGRAM_BOT_TOKEN") configuredChannelIds.add("telegram");
	}
	if (hasWhatsAppAuthState(env)) configuredChannelIds.add("whatsapp");
	return [...configuredChannelIds];
}
function hasEnvConfiguredChannel(env) {
	for (const [key, value] of Object.entries(env)) {
		if (!hasNonEmptyString(value)) continue;
		if (CHANNEL_ENV_PREFIXES.some(([prefix]) => key.startsWith(prefix)) || key === "TELEGRAM_BOT_TOKEN") return true;
	}
	return hasWhatsAppAuthState(env);
}
function hasPotentialConfiguredChannels(cfg, env = process.env) {
	const channels = isRecord(cfg.channels) ? cfg.channels : null;
	if (channels) for (const [key, value] of Object.entries(channels)) {
		if (IGNORED_CHANNEL_CONFIG_KEYS.has(key)) continue;
		if (hasMeaningfulChannelConfig(value)) return true;
	}
	return hasEnvConfiguredChannel(env);
}
//#endregion
//#region src/config/sessions/types.ts
function normalizeRuntimeField(value) {
	const trimmed = value?.trim();
	return trimmed ? trimmed : void 0;
}
function normalizeSessionRuntimeModelFields(entry) {
	const normalizedModel = normalizeRuntimeField(entry.model);
	const normalizedProvider = normalizeRuntimeField(entry.modelProvider);
	let next = entry;
	if (!normalizedModel) {
		if (entry.model !== void 0 || entry.modelProvider !== void 0) {
			next = { ...next };
			delete next.model;
			delete next.modelProvider;
		}
		return next;
	}
	if (entry.model !== normalizedModel) {
		if (next === entry) next = { ...next };
		next.model = normalizedModel;
	}
	if (!normalizedProvider) {
		if (entry.modelProvider !== void 0) {
			if (next === entry) next = { ...next };
			delete next.modelProvider;
		}
		return next;
	}
	if (entry.modelProvider !== normalizedProvider) {
		if (next === entry) next = { ...next };
		next.modelProvider = normalizedProvider;
	}
	return next;
}
function setSessionRuntimeModel(entry, runtime) {
	const provider = runtime.provider.trim();
	const model = runtime.model.trim();
	if (!provider || !model) return false;
	entry.modelProvider = provider;
	entry.model = model;
	return true;
}
function resolveMergedUpdatedAt(existing, patch, options) {
	if (options?.policy === "preserve-activity" && existing) return existing.updatedAt ?? patch.updatedAt ?? options.now ?? Date.now();
	return Math.max(existing?.updatedAt ?? 0, patch.updatedAt ?? 0, options?.now ?? Date.now());
}
function mergeSessionEntryWithPolicy(existing, patch, options) {
	const sessionId = patch.sessionId ?? existing?.sessionId ?? crypto.randomUUID();
	const updatedAt = resolveMergedUpdatedAt(existing, patch, options);
	if (!existing) return normalizeSessionRuntimeModelFields({
		...patch,
		sessionId,
		updatedAt
	});
	const next = {
		...existing,
		...patch,
		sessionId,
		updatedAt
	};
	if (Object.hasOwn(patch, "model") && !Object.hasOwn(patch, "modelProvider")) {
		const patchedModel = normalizeRuntimeField(patch.model);
		const existingModel = normalizeRuntimeField(existing.model);
		if (patchedModel && patchedModel !== existingModel) delete next.modelProvider;
	}
	return normalizeSessionRuntimeModelFields(next);
}
function mergeSessionEntry(existing, patch) {
	return mergeSessionEntryWithPolicy(existing, patch);
}
function mergeSessionEntryPreserveActivity(existing, patch) {
	return mergeSessionEntryWithPolicy(existing, patch, { policy: "preserve-activity" });
}
function resolveFreshSessionTotalTokens(entry) {
	const total = entry?.totalTokens;
	if (typeof total !== "number" || !Number.isFinite(total) || total < 0) return;
	if (entry?.totalTokensFresh === false) return;
	return total;
}
const DEFAULT_RESET_TRIGGERS = ["/new", "/reset"];
//#endregion
//#region src/infra/format-time/format-duration.ts
function formatDurationSeconds(ms, options = {}) {
	if (!Number.isFinite(ms)) return "unknown";
	const decimals = options.decimals ?? 1;
	const unit = options.unit ?? "s";
	const trimmed = (Math.max(0, ms) / 1e3).toFixed(Math.max(0, decimals)).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
	return unit === "seconds" ? `${trimmed} seconds` : `${trimmed}s`;
}
/** Precise decimal-seconds output: "500ms" or "1.23s". Input is milliseconds. */
function formatDurationPrecise(ms, options = {}) {
	if (!Number.isFinite(ms)) return "unknown";
	if (ms < 1e3) return `${Math.max(0, Math.round(ms))}ms`;
	return formatDurationSeconds(ms, {
		decimals: options.decimals ?? 2,
		unit: options.unit ?? "s"
	});
}
/**
* Compact compound duration: "500ms", "45s", "2m5s", "1h30m".
* With `spaced`: "45s", "2m 5s", "1h 30m".
* Omits trailing zero components: "1m" not "1m 0s", "2h" not "2h 0m".
* Returns undefined for null/undefined/non-finite/non-positive input.
*/
function formatDurationCompact(ms, options) {
	if (ms == null || !Number.isFinite(ms) || ms <= 0) return;
	if (ms < 1e3) return `${Math.round(ms)}ms`;
	const sep = options?.spaced ? " " : "";
	const totalSeconds = Math.round(ms / 1e3);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor(totalSeconds % 3600 / 60);
	const seconds = totalSeconds % 60;
	if (hours >= 24) {
		const days = Math.floor(hours / 24);
		const remainingHours = hours % 24;
		return remainingHours > 0 ? `${days}d${sep}${remainingHours}h` : `${days}d`;
	}
	if (hours > 0) return minutes > 0 ? `${hours}h${sep}${minutes}m` : `${hours}h`;
	if (minutes > 0) return seconds > 0 ? `${minutes}m${sep}${seconds}s` : `${minutes}m`;
	return `${seconds}s`;
}
/**
* Rounded single-unit duration for display: "500ms", "5s", "3m", "2h", "5d".
* Returns fallback string for null/undefined/non-finite input.
*/
function formatDurationHuman(ms, fallback = "n/a") {
	if (ms == null || !Number.isFinite(ms) || ms < 0) return fallback;
	if (ms < 1e3) return `${Math.round(ms)}ms`;
	const sec = Math.round(ms / 1e3);
	if (sec < 60) return `${sec}s`;
	const min = Math.round(sec / 60);
	if (min < 60) return `${min}m`;
	const hr = Math.round(min / 60);
	if (hr < 24) return `${hr}h`;
	return `${Math.round(hr / 24)}d`;
}
//#endregion
//#region src/infra/system-events.ts
const MAX_EVENTS = 20;
const queues = /* @__PURE__ */ new Map();
function requireSessionKey(key) {
	const trimmed = typeof key === "string" ? key.trim() : "";
	if (!trimmed) throw new Error("system events require a sessionKey");
	return trimmed;
}
function normalizeContextKey(key) {
	if (!key) return null;
	const trimmed = key.trim();
	if (!trimmed) return null;
	return trimmed.toLowerCase();
}
function isSystemEventContextChanged(sessionKey, contextKey) {
	const key = requireSessionKey(sessionKey);
	const existing = queues.get(key);
	return normalizeContextKey(contextKey) !== (existing?.lastContextKey ?? null);
}
function enqueueSystemEvent(text, options) {
	const key = requireSessionKey(options?.sessionKey);
	const entry = queues.get(key) ?? (() => {
		const created = {
			queue: [],
			lastText: null,
			lastContextKey: null
		};
		queues.set(key, created);
		return created;
	})();
	const cleaned = text.trim();
	if (!cleaned) return false;
	const normalizedContextKey = normalizeContextKey(options?.contextKey);
	entry.lastContextKey = normalizedContextKey;
	if (entry.lastText === cleaned) return false;
	entry.lastText = cleaned;
	entry.queue.push({
		text: cleaned,
		ts: Date.now(),
		contextKey: normalizedContextKey
	});
	if (entry.queue.length > MAX_EVENTS) entry.queue.shift();
	return true;
}
function drainSystemEventEntries(sessionKey) {
	const key = requireSessionKey(sessionKey);
	const entry = queues.get(key);
	if (!entry || entry.queue.length === 0) return [];
	const out = entry.queue.slice();
	entry.queue.length = 0;
	entry.lastText = null;
	entry.lastContextKey = null;
	queues.delete(key);
	return out;
}
function drainSystemEvents(sessionKey) {
	return drainSystemEventEntries(sessionKey).map((event) => event.text);
}
function peekSystemEventEntries(sessionKey) {
	const key = requireSessionKey(sessionKey);
	return queues.get(key)?.queue.map((event) => ({ ...event })) ?? [];
}
function peekSystemEvents(sessionKey) {
	return peekSystemEventEntries(sessionKey).map((event) => event.text);
}
function hasSystemEvents(sessionKey) {
	const key = requireSessionKey(sessionKey);
	return (queues.get(key)?.queue.length ?? 0) > 0;
}
function resetSystemEventsForTest() {
	queues.clear();
}
//#endregion
//#region src/auto-reply/tokens.ts
const HEARTBEAT_TOKEN = "HEARTBEAT_OK";
const SILENT_REPLY_TOKEN = "NO_REPLY";
const silentExactRegexByToken = /* @__PURE__ */ new Map();
const silentTrailingRegexByToken = /* @__PURE__ */ new Map();
function getSilentExactRegex(token) {
	const cached = silentExactRegexByToken.get(token);
	if (cached) return cached;
	const escaped = escapeRegExp(token);
	const regex = new RegExp(`^\\s*${escaped}\\s*$`);
	silentExactRegexByToken.set(token, regex);
	return regex;
}
function getSilentTrailingRegex(token) {
	const cached = silentTrailingRegexByToken.get(token);
	if (cached) return cached;
	const escaped = escapeRegExp(token);
	const regex = new RegExp(`(?:^|\\s+|\\*+)${escaped}\\s*$`);
	silentTrailingRegexByToken.set(token, regex);
	return regex;
}
function isSilentReplyText(text, token = SILENT_REPLY_TOKEN) {
	if (!text) return false;
	return getSilentExactRegex(token).test(text);
}
/**
* Strip a trailing silent reply token from mixed-content text.
* Returns the remaining text with the token removed (trimmed).
* If the result is empty, the entire message should be treated as silent.
*/
function stripSilentToken(text, token = SILENT_REPLY_TOKEN) {
	return text.replace(getSilentTrailingRegex(token), "").trim();
}
function isSilentReplyPrefixText(text, token = SILENT_REPLY_TOKEN) {
	if (!text) return false;
	const trimmed = text.trimStart();
	if (!trimmed) return false;
	if (trimmed !== trimmed.toUpperCase()) return false;
	const normalized = trimmed.toUpperCase();
	if (!normalized) return false;
	if (normalized.length < 2) return false;
	if (/[^A-Z_]/.test(normalized)) return false;
	const tokenUpper = token.toUpperCase();
	if (!tokenUpper.startsWith(normalized)) return false;
	if (normalized.includes("_")) return true;
	return tokenUpper === "NO_REPLY" && normalized === "NO";
}
//#endregion
//#region src/config/sessions/main-session.ts
const FALLBACK_DEFAULT_AGENT_ID = "main";
function buildMainSessionKey(agentId, mainKey) {
	return `agent:${normalizeAgentId(agentId)}:${normalizeMainKey(mainKey)}`;
}
function resolveMainSessionKey(cfg) {
	if (cfg?.session?.scope === "global") return "global";
	const agents = cfg?.agents?.list ?? [];
	return buildMainSessionKey(agents.find((agent) => agent?.default)?.id ?? agents[0]?.id ?? FALLBACK_DEFAULT_AGENT_ID, cfg?.session?.mainKey);
}
function resolveAgentMainSessionKey(params) {
	return buildMainSessionKey(params.agentId, params.cfg?.session?.mainKey);
}
function resolveExplicitAgentSessionKey(params) {
	const agentId = params.agentId?.trim();
	if (!agentId) return;
	return resolveAgentMainSessionKey({
		cfg: params.cfg,
		agentId
	});
}
function canonicalizeMainSessionAlias(params) {
	const raw = params.sessionKey.trim();
	if (!raw) return raw;
	const agentId = normalizeAgentId(params.agentId);
	const mainKey = normalizeMainKey(params.cfg?.session?.mainKey);
	const agentMainSessionKey = buildMainSessionKey(agentId, mainKey);
	const agentMainAliasKey = buildMainSessionKey(agentId, "main");
	const isMainAlias = raw === "main" || raw === mainKey || raw === agentMainSessionKey || raw === agentMainAliasKey;
	if (params.cfg?.session?.scope === "global" && isMainAlias) return "global";
	if (isMainAlias) return agentMainSessionKey;
	return raw;
}
//#endregion
//#region src/auto-reply/heartbeat.ts
const HEARTBEAT_PROMPT = "Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.";
const DEFAULT_HEARTBEAT_EVERY = "30m";
const DEFAULT_HEARTBEAT_ACK_MAX_CHARS = 300;
/**
* Check if HEARTBEAT.md content is "effectively empty" - meaning it has no actionable tasks.
* This allows skipping heartbeat API calls when no tasks are configured.
*
* A file is considered effectively empty if it contains only:
* - Whitespace
* - Comment lines (lines starting with #)
* - Empty lines
*
* Note: A missing file returns false (not effectively empty) so the LLM can still
* decide what to do. This function is only for when the file exists but has no content.
*/
function isHeartbeatContentEffectivelyEmpty(content) {
	if (content === void 0 || content === null) return false;
	if (typeof content !== "string") return false;
	const lines = content.split("\n");
	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed) continue;
		if (/^#+(\s|$)/.test(trimmed)) continue;
		if (/^[-*+]\s*(\[[\sXx]?\]\s*)?$/.test(trimmed)) continue;
		return false;
	}
	return true;
}
function resolveHeartbeatPrompt(raw) {
	return (typeof raw === "string" ? raw.trim() : "") || "Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.";
}
function stripTokenAtEdges(raw) {
	let text = raw.trim();
	if (!text) return {
		text: "",
		didStrip: false
	};
	const token = HEARTBEAT_TOKEN;
	const tokenAtEndWithOptionalTrailingPunctuation = new RegExp(`${escapeRegExp(token)}[^\\w]{0,4}$`);
	if (!text.includes(token)) return {
		text,
		didStrip: false
	};
	let didStrip = false;
	let changed = true;
	while (changed) {
		changed = false;
		const next = text.trim();
		if (next.startsWith(token)) {
			text = next.slice(12).trimStart();
			didStrip = true;
			changed = true;
			continue;
		}
		if (tokenAtEndWithOptionalTrailingPunctuation.test(next)) {
			const idx = next.lastIndexOf(token);
			const before = next.slice(0, idx).trimEnd();
			if (!before) text = "";
			else text = `${before}${next.slice(idx + 12).trimStart()}`.trimEnd();
			didStrip = true;
			changed = true;
		}
	}
	return {
		text: text.replace(/\s+/g, " ").trim(),
		didStrip
	};
}
function stripHeartbeatToken(raw, opts = {}) {
	if (!raw) return {
		shouldSkip: true,
		text: "",
		didStrip: false
	};
	const trimmed = raw.trim();
	if (!trimmed) return {
		shouldSkip: true,
		text: "",
		didStrip: false
	};
	const mode = opts.mode ?? "message";
	const maxAckCharsRaw = opts.maxAckChars;
	const parsedAckChars = typeof maxAckCharsRaw === "string" ? Number(maxAckCharsRaw) : maxAckCharsRaw;
	const maxAckChars = Math.max(0, typeof parsedAckChars === "number" && Number.isFinite(parsedAckChars) ? parsedAckChars : 300);
	const stripMarkup = (text) => text.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/^[*`~_]+/, "").replace(/[*`~_]+$/, "");
	const trimmedNormalized = stripMarkup(trimmed);
	if (!(trimmed.includes("HEARTBEAT_OK") || trimmedNormalized.includes("HEARTBEAT_OK"))) return {
		shouldSkip: false,
		text: trimmed,
		didStrip: false
	};
	const strippedOriginal = stripTokenAtEdges(trimmed);
	const strippedNormalized = stripTokenAtEdges(trimmedNormalized);
	const picked = strippedOriginal.didStrip && strippedOriginal.text ? strippedOriginal : strippedNormalized;
	if (!picked.didStrip) return {
		shouldSkip: false,
		text: trimmed,
		didStrip: false
	};
	if (!picked.text) return {
		shouldSkip: true,
		text: "",
		didStrip: true
	};
	const rest = picked.text.trim();
	if (mode === "heartbeat") {
		if (rest.length <= maxAckChars) return {
			shouldSkip: true,
			text: "",
			didStrip: true
		};
	}
	return {
		shouldSkip: false,
		text: rest,
		didStrip: true
	};
}
//#endregion
//#region src/shared/lazy-runtime.ts
function createLazyRuntimeSurface(importer, select) {
	let cached = null;
	return () => {
		cached ??= importer().then(select);
		return cached;
	};
}
function createLazyRuntimeMethod(load, select) {
	const invoke = async (...args) => {
		return await select(await load())(...args);
	};
	return invoke;
}
//#endregion
export { DEFAULT_RESET_TRIGGERS as A, peekSystemEventEntries as C, formatDurationHuman as D, formatDurationCompact as E, setSessionRuntimeModel as F, hasMeaningfulChannelConfig as I, hasPotentialConfiguredChannels as L, mergeSessionEntryPreserveActivity as M, normalizeSessionRuntimeModelFields as N, formatDurationPrecise as O, resolveFreshSessionTotalTokens as P, listPotentialConfiguredChannelIds as R, isSystemEventContextChanged as S, resetSystemEventsForTest as T, stripSilentToken as _, HEARTBEAT_PROMPT as a, enqueueSystemEvent as b, stripHeartbeatToken as c, resolveExplicitAgentSessionKey as d, resolveMainSessionKey as f, isSilentReplyText as g, isSilentReplyPrefixText as h, DEFAULT_HEARTBEAT_EVERY as i, mergeSessionEntry as j, formatDurationSeconds as k, canonicalizeMainSessionAlias as l, SILENT_REPLY_TOKEN as m, createLazyRuntimeSurface as n, isHeartbeatContentEffectivelyEmpty as o, HEARTBEAT_TOKEN as p, DEFAULT_HEARTBEAT_ACK_MAX_CHARS as r, resolveHeartbeatPrompt as s, createLazyRuntimeMethod as t, resolveAgentMainSessionKey as u, drainSystemEventEntries as v, peekSystemEvents as w, hasSystemEvents as x, drainSystemEvents as y };
