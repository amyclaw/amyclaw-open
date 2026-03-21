import { i as isBlockedObjectKey, n as normalizeAccountId } from "./account-id-O4Og6DrK.js";
//#region src/plugin-sdk/allowlist-config-edit.ts
const LEGACY_DM_ALLOWLIST_CONFIG_PATHS = {
	readPaths: [["allowFrom"], ["dm", "allowFrom"]],
	writePath: ["allowFrom"],
	cleanupPaths: [["dm", "allowFrom"]]
};
function resolveLegacyDmAllowlistConfigPaths(scope) {
	return scope === "dm" ? LEGACY_DM_ALLOWLIST_CONFIG_PATHS : null;
}
function resolveAccountScopedWriteTarget(parsed, channelId, accountId) {
	const channels = parsed.channels ??= {};
	const channel = channels[channelId] ??= {};
	const normalizedAccountId = normalizeAccountId(accountId);
	if (isBlockedObjectKey(normalizedAccountId)) return {
		target: channel,
		pathPrefix: `channels.${channelId}`,
		writeTarget: {
			kind: "channel",
			scope: { channelId }
		}
	};
	const hasAccounts = Boolean(channel.accounts && typeof channel.accounts === "object");
	if (!(normalizedAccountId !== "default" || hasAccounts)) return {
		target: channel,
		pathPrefix: `channels.${channelId}`,
		writeTarget: {
			kind: "channel",
			scope: { channelId }
		}
	};
	const accounts = channel.accounts ??= {};
	const existingAccount = Object.hasOwn(accounts, normalizedAccountId) ? accounts[normalizedAccountId] : void 0;
	if (!existingAccount || typeof existingAccount !== "object") accounts[normalizedAccountId] = {};
	return {
		target: accounts[normalizedAccountId],
		pathPrefix: `channels.${channelId}.accounts.${normalizedAccountId}`,
		writeTarget: {
			kind: "account",
			scope: {
				channelId,
				accountId: normalizedAccountId
			}
		}
	};
}
function getNestedValue(root, path) {
	let current = root;
	for (const key of path) {
		if (!current || typeof current !== "object") return;
		current = current[key];
	}
	return current;
}
function ensureNestedObject(root, path) {
	let current = root;
	for (const key of path) {
		const existing = current[key];
		if (!existing || typeof existing !== "object") current[key] = {};
		current = current[key];
	}
	return current;
}
function setNestedValue(root, path, value) {
	if (path.length === 0) return;
	if (path.length === 1) {
		root[path[0]] = value;
		return;
	}
	const parent = ensureNestedObject(root, path.slice(0, -1));
	parent[path[path.length - 1]] = value;
}
function deleteNestedValue(root, path) {
	if (path.length === 0) return;
	if (path.length === 1) {
		delete root[path[0]];
		return;
	}
	const parent = getNestedValue(root, path.slice(0, -1));
	if (!parent || typeof parent !== "object") return;
	delete parent[path[path.length - 1]];
}
function applyAccountScopedAllowlistConfigEdit(params) {
	const resolvedTarget = resolveAccountScopedWriteTarget(params.parsedConfig, params.channelId, params.accountId);
	const existing = [];
	for (const path of params.paths.readPaths) {
		const existingRaw = getNestedValue(resolvedTarget.target, path);
		if (!Array.isArray(existingRaw)) continue;
		for (const entry of existingRaw) {
			const value = String(entry).trim();
			if (!value || existing.includes(value)) continue;
			existing.push(value);
		}
	}
	const normalizedEntry = params.normalize([params.entry]);
	if (normalizedEntry.length === 0) return { kind: "invalid-entry" };
	const existingNormalized = params.normalize(existing);
	const shouldMatch = (value) => normalizedEntry.includes(value);
	let changed = false;
	let next = existing;
	const configHasEntry = existingNormalized.some((value) => shouldMatch(value));
	if (params.action === "add") {
		if (!configHasEntry) {
			next = [...existing, params.entry.trim()];
			changed = true;
		}
	} else {
		const keep = [];
		for (const entry of existing) {
			if (params.normalize([entry]).some((value) => shouldMatch(value))) {
				changed = true;
				continue;
			}
			keep.push(entry);
		}
		next = keep;
	}
	if (changed) {
		if (next.length === 0) deleteNestedValue(resolvedTarget.target, params.paths.writePath);
		else setNestedValue(resolvedTarget.target, params.paths.writePath, next);
		for (const path of params.paths.cleanupPaths ?? []) deleteNestedValue(resolvedTarget.target, path);
	}
	return {
		kind: "ok",
		changed,
		pathLabel: `${resolvedTarget.pathPrefix}.${params.paths.writePath.join(".")}`,
		writeTarget: resolvedTarget.writeTarget
	};
}
/** Build the default account-scoped allowlist editor used by channel plugins with config-backed lists. */
function buildAccountScopedAllowlistConfigEditor(params) {
	return ({ cfg, parsedConfig, accountId, scope, action, entry }) => {
		const paths = params.resolvePaths(scope);
		if (!paths) return null;
		return applyAccountScopedAllowlistConfigEdit({
			parsedConfig,
			channelId: params.channelId,
			accountId,
			action,
			entry,
			normalize: (values) => params.normalize({
				cfg,
				accountId,
				values
			}),
			paths
		});
	};
}
//#endregion
export { resolveLegacyDmAllowlistConfigPaths as n, buildAccountScopedAllowlistConfigEditor as t };
