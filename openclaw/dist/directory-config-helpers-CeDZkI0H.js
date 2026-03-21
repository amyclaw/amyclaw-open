//#region src/channels/plugins/directory-config-helpers.ts
function resolveDirectoryQuery(query) {
	return query?.trim().toLowerCase() || "";
}
function resolveDirectoryLimit(limit) {
	return typeof limit === "number" && limit > 0 ? limit : void 0;
}
function applyDirectoryQueryAndLimit(ids, params) {
	const q = resolveDirectoryQuery(params.query);
	const limit = resolveDirectoryLimit(params.limit);
	const filtered = ids.filter((id) => q ? id.toLowerCase().includes(q) : true);
	return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
}
function toDirectoryEntries(kind, ids) {
	return ids.map((id) => ({
		kind,
		id
	}));
}
function normalizeDirectoryIds(params) {
	return params.rawIds.map((entry) => entry.trim()).filter((entry) => Boolean(entry) && entry !== "*").map((entry) => {
		const normalized = params.normalizeId ? params.normalizeId(entry) : entry;
		return typeof normalized === "string" ? normalized.trim() : "";
	}).filter(Boolean);
}
function collectDirectoryIdsFromEntries(params) {
	return normalizeDirectoryIds({
		rawIds: (params.entries ?? []).map((entry) => String(entry)),
		normalizeId: params.normalizeId
	});
}
function collectDirectoryIdsFromMapKeys(params) {
	return normalizeDirectoryIds({
		rawIds: Object.keys(params.groups ?? {}),
		normalizeId: params.normalizeId
	});
}
function dedupeDirectoryIds(ids) {
	return Array.from(new Set(ids));
}
function listDirectoryUserEntriesFromAllowFrom(params) {
	return toDirectoryEntries("user", applyDirectoryQueryAndLimit(dedupeDirectoryIds(collectDirectoryIdsFromEntries({
		entries: params.allowFrom,
		normalizeId: params.normalizeId
	})), params));
}
function listDirectoryUserEntriesFromAllowFromAndMapKeys(params) {
	return toDirectoryEntries("user", applyDirectoryQueryAndLimit(dedupeDirectoryIds([...collectDirectoryIdsFromEntries({
		entries: params.allowFrom,
		normalizeId: params.normalizeAllowFromId
	}), ...collectDirectoryIdsFromMapKeys({
		groups: params.map,
		normalizeId: params.normalizeMapKeyId
	})]), params));
}
function listDirectoryGroupEntriesFromMapKeys(params) {
	return toDirectoryEntries("group", applyDirectoryQueryAndLimit(dedupeDirectoryIds(collectDirectoryIdsFromMapKeys({
		groups: params.groups,
		normalizeId: params.normalizeId
	})), params));
}
function listDirectoryGroupEntriesFromMapKeysAndAllowFrom(params) {
	return toDirectoryEntries("group", applyDirectoryQueryAndLimit(dedupeDirectoryIds([...collectDirectoryIdsFromMapKeys({
		groups: params.groups,
		normalizeId: params.normalizeMapKeyId
	}), ...collectDirectoryIdsFromEntries({
		entries: params.allowFrom,
		normalizeId: params.normalizeAllowFromId
	})]), params));
}
//#endregion
export { listDirectoryUserEntriesFromAllowFromAndMapKeys as a, listDirectoryUserEntriesFromAllowFrom as i, listDirectoryGroupEntriesFromMapKeys as n, toDirectoryEntries as o, listDirectoryGroupEntriesFromMapKeysAndAllowFrom as r, applyDirectoryQueryAndLimit as t };
