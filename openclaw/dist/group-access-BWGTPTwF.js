//#region src/config/runtime-group-policy.ts
function resolveRuntimeGroupPolicy(params) {
	const configuredFallbackPolicy = params.configuredFallbackPolicy ?? "open";
	const missingProviderFallbackPolicy = params.missingProviderFallbackPolicy ?? "allowlist";
	return {
		groupPolicy: params.providerConfigPresent ? params.groupPolicy ?? params.defaultGroupPolicy ?? configuredFallbackPolicy : params.groupPolicy ?? missingProviderFallbackPolicy,
		providerMissingFallbackApplied: !params.providerConfigPresent && params.groupPolicy === void 0
	};
}
function resolveDefaultGroupPolicy(cfg) {
	return cfg.channels?.defaults?.groupPolicy;
}
const GROUP_POLICY_BLOCKED_LABEL = {
	group: "group messages",
	guild: "guild messages",
	room: "room messages",
	channel: "channel messages",
	space: "space messages"
};
/**
* Standard provider runtime policy:
* - configured provider fallback: open
* - missing provider fallback: allowlist (fail-closed)
*/
function resolveOpenProviderRuntimeGroupPolicy(params) {
	return resolveRuntimeGroupPolicy({
		providerConfigPresent: params.providerConfigPresent,
		groupPolicy: params.groupPolicy,
		defaultGroupPolicy: params.defaultGroupPolicy,
		configuredFallbackPolicy: "open",
		missingProviderFallbackPolicy: "allowlist"
	});
}
/**
* Strict provider runtime policy:
* - configured provider fallback: allowlist
* - missing provider fallback: allowlist (fail-closed)
*/
function resolveAllowlistProviderRuntimeGroupPolicy(params) {
	return resolveRuntimeGroupPolicy({
		providerConfigPresent: params.providerConfigPresent,
		groupPolicy: params.groupPolicy,
		defaultGroupPolicy: params.defaultGroupPolicy,
		configuredFallbackPolicy: "allowlist",
		missingProviderFallbackPolicy: "allowlist"
	});
}
const warnedMissingProviderGroupPolicy = /* @__PURE__ */ new Set();
function warnMissingProviderGroupPolicyFallbackOnce(params) {
	if (!params.providerMissingFallbackApplied) return false;
	const key = `${params.providerKey}:${params.accountId ?? "*"}`;
	if (warnedMissingProviderGroupPolicy.has(key)) return false;
	warnedMissingProviderGroupPolicy.add(key);
	const blockedLabel = params.blockedLabel?.trim() || "group messages";
	params.log(`${params.providerKey}: channels.${params.providerKey} is missing; defaulting groupPolicy to "allowlist" (${blockedLabel} blocked until explicitly configured).`);
	return true;
}
/**
* Test helper. Keeps warning-cache state deterministic across test files.
*/
function resetMissingProviderGroupPolicyFallbackWarningsForTesting() {
	warnedMissingProviderGroupPolicy.clear();
}
//#endregion
//#region src/plugin-sdk/group-access.ts
/** Downgrade sender-scoped group policy to open mode when no allowlist is configured. */
function resolveSenderScopedGroupPolicy(params) {
	if (params.groupPolicy === "disabled") return "disabled";
	return params.groupAllowFrom.length > 0 ? "allowlist" : "open";
}
/** Evaluate route-level group access after policy, route match, and enablement checks. */
function evaluateGroupRouteAccessForPolicy(params) {
	if (params.groupPolicy === "disabled") return {
		allowed: false,
		groupPolicy: params.groupPolicy,
		reason: "disabled"
	};
	if (params.routeMatched && params.routeEnabled === false) return {
		allowed: false,
		groupPolicy: params.groupPolicy,
		reason: "route_disabled"
	};
	if (params.groupPolicy === "allowlist") {
		if (!params.routeAllowlistConfigured) return {
			allowed: false,
			groupPolicy: params.groupPolicy,
			reason: "empty_allowlist"
		};
		if (!params.routeMatched) return {
			allowed: false,
			groupPolicy: params.groupPolicy,
			reason: "route_not_allowlisted"
		};
	}
	return {
		allowed: true,
		groupPolicy: params.groupPolicy,
		reason: "allowed"
	};
}
/** Evaluate generic allowlist match state for channels that compare derived group identifiers. */
function evaluateMatchedGroupAccessForPolicy(params) {
	if (params.groupPolicy === "disabled") return {
		allowed: false,
		groupPolicy: params.groupPolicy,
		reason: "disabled"
	};
	if (params.groupPolicy === "allowlist") {
		if (params.requireMatchInput && !params.hasMatchInput) return {
			allowed: false,
			groupPolicy: params.groupPolicy,
			reason: "missing_match_input"
		};
		if (!params.allowlistConfigured) return {
			allowed: false,
			groupPolicy: params.groupPolicy,
			reason: "empty_allowlist"
		};
		if (!params.allowlistMatched) return {
			allowed: false,
			groupPolicy: params.groupPolicy,
			reason: "not_allowlisted"
		};
	}
	return {
		allowed: true,
		groupPolicy: params.groupPolicy,
		reason: "allowed"
	};
}
/** Evaluate sender access for an already-resolved group policy and allowlist. */
function evaluateSenderGroupAccessForPolicy(params) {
	if (params.groupPolicy === "disabled") return {
		allowed: false,
		groupPolicy: params.groupPolicy,
		providerMissingFallbackApplied: Boolean(params.providerMissingFallbackApplied),
		reason: "disabled"
	};
	if (params.groupPolicy === "allowlist") {
		if (params.groupAllowFrom.length === 0) return {
			allowed: false,
			groupPolicy: params.groupPolicy,
			providerMissingFallbackApplied: Boolean(params.providerMissingFallbackApplied),
			reason: "empty_allowlist"
		};
		if (!params.isSenderAllowed(params.senderId, params.groupAllowFrom)) return {
			allowed: false,
			groupPolicy: params.groupPolicy,
			providerMissingFallbackApplied: Boolean(params.providerMissingFallbackApplied),
			reason: "sender_not_allowlisted"
		};
	}
	return {
		allowed: true,
		groupPolicy: params.groupPolicy,
		providerMissingFallbackApplied: Boolean(params.providerMissingFallbackApplied),
		reason: "allowed"
	};
}
/** Resolve provider fallback policy first, then evaluate sender access against that result. */
function evaluateSenderGroupAccess(params) {
	const { groupPolicy, providerMissingFallbackApplied } = resolveOpenProviderRuntimeGroupPolicy({
		providerConfigPresent: params.providerConfigPresent,
		groupPolicy: params.configuredGroupPolicy,
		defaultGroupPolicy: params.defaultGroupPolicy
	});
	return evaluateSenderGroupAccessForPolicy({
		groupPolicy,
		providerMissingFallbackApplied,
		groupAllowFrom: params.groupAllowFrom,
		senderId: params.senderId,
		isSenderAllowed: params.isSenderAllowed
	});
}
//#endregion
export { resolveSenderScopedGroupPolicy as a, resolveAllowlistProviderRuntimeGroupPolicy as c, resolveRuntimeGroupPolicy as d, warnMissingProviderGroupPolicyFallbackOnce as f, evaluateSenderGroupAccessForPolicy as i, resolveDefaultGroupPolicy as l, evaluateMatchedGroupAccessForPolicy as n, GROUP_POLICY_BLOCKED_LABEL as o, evaluateSenderGroupAccess as r, resetMissingProviderGroupPolicyFallbackWarningsForTesting as s, evaluateGroupRouteAccessForPolicy as t, resolveOpenProviderRuntimeGroupPolicy as u };
