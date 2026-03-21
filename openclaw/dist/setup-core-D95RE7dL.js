import { m as normalizeE164 } from "./utils-BMtC0Ocd.js";
import { t as formatDocsLink } from "./links-DA9sitJV.js";
import { Bx as listSignalAccountIds, Eg as setChannelDmPolicyWithAllowFrom, Hx as resolveSignalAccount, Og as setSetupChannelEnabled, Ow as createPatchedAccountSetupAdapter, Vx as resolveDefaultSignalAccountId, hg as parseSetupEntriesAllowingWildcard, yg as promptParsedAllowFromForScopedChannel } from "./auth-profiles-Bc6TPi0n.js";
import { t as formatCliCommand } from "./command-format-C8aJknFW.js";
//#region extensions/signal/src/setup-core.ts
const channel = "signal";
const MIN_E164_DIGITS = 5;
const MAX_E164_DIGITS = 15;
const DIGITS_ONLY = /^\d+$/;
const INVALID_SIGNAL_ACCOUNT_ERROR = "Invalid E.164 phone number (must start with + and country code, e.g. +15555550123)";
function normalizeSignalAccountInput(value) {
	const trimmed = value?.trim();
	if (!trimmed) return null;
	const digits = normalizeE164(trimmed).slice(1);
	if (!DIGITS_ONLY.test(digits)) return null;
	if (digits.length < MIN_E164_DIGITS || digits.length > MAX_E164_DIGITS) return null;
	return `+${digits}`;
}
function isUuidLike(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
function parseSignalAllowFromEntries(raw) {
	return parseSetupEntriesAllowingWildcard(raw, (entry) => {
		if (entry.toLowerCase().startsWith("uuid:")) {
			const id = entry.slice(5).trim();
			if (!id) return { error: "Invalid uuid entry" };
			return { value: `uuid:${id}` };
		}
		if (isUuidLike(entry)) return { value: `uuid:${entry}` };
		const normalized = normalizeSignalAccountInput(entry);
		if (!normalized) return { error: `Invalid entry: ${entry}` };
		return { value: normalized };
	});
}
function buildSignalSetupPatch(input) {
	return {
		...input.signalNumber ? { account: input.signalNumber } : {},
		...input.cliPath ? { cliPath: input.cliPath } : {},
		...input.httpUrl ? { httpUrl: input.httpUrl } : {},
		...input.httpHost ? { httpHost: input.httpHost } : {},
		...input.httpPort ? { httpPort: Number(input.httpPort) } : {}
	};
}
async function promptSignalAllowFrom(params) {
	return promptParsedAllowFromForScopedChannel({
		cfg: params.cfg,
		channel,
		accountId: params.accountId,
		defaultAccountId: resolveDefaultSignalAccountId(params.cfg),
		prompter: params.prompter,
		noteTitle: "Signal allowlist",
		noteLines: [
			"Allowlist Signal DMs by sender id.",
			"Examples:",
			"- +15555550123",
			"- uuid:123e4567-e89b-12d3-a456-426614174000",
			"Multiple entries: comma-separated.",
			`Docs: ${formatDocsLink("/signal", "signal")}`
		],
		message: "Signal allowFrom (E.164 or uuid)",
		placeholder: "+15555550123, uuid:123e4567-e89b-12d3-a456-426614174000",
		parseEntries: parseSignalAllowFromEntries,
		getExistingAllowFrom: ({ cfg, accountId }) => resolveSignalAccount({
			cfg,
			accountId
		}).config.allowFrom ?? []
	});
}
const signalDmPolicy = {
	label: "Signal",
	channel,
	policyKey: "channels.signal.dmPolicy",
	allowFromKey: "channels.signal.allowFrom",
	getCurrent: (cfg) => cfg.channels?.signal?.dmPolicy ?? "pairing",
	setPolicy: (cfg, policy) => setChannelDmPolicyWithAllowFrom({
		cfg,
		channel,
		dmPolicy: policy
	}),
	promptAllowFrom: promptSignalAllowFrom
};
function resolveSignalCliPath(params) {
	return (typeof params.credentialValues.cliPath === "string" ? params.credentialValues.cliPath : void 0) ?? resolveSignalAccount({
		cfg: params.cfg,
		accountId: params.accountId
	}).config.cliPath ?? "signal-cli";
}
function createSignalCliPathTextInput(shouldPrompt) {
	return {
		inputKey: "cliPath",
		message: "signal-cli path",
		currentValue: ({ cfg, accountId, credentialValues }) => resolveSignalCliPath({
			cfg,
			accountId,
			credentialValues
		}),
		initialValue: ({ cfg, accountId, credentialValues }) => resolveSignalCliPath({
			cfg,
			accountId,
			credentialValues
		}),
		shouldPrompt,
		confirmCurrentValue: false,
		applyCurrentValue: true,
		helpTitle: "Signal",
		helpLines: ["signal-cli not found. Install it, then rerun this step or set channels.signal.cliPath."]
	};
}
const signalNumberTextInput = {
	inputKey: "signalNumber",
	message: "Signal bot number (E.164)",
	currentValue: ({ cfg, accountId }) => normalizeSignalAccountInput(resolveSignalAccount({
		cfg,
		accountId
	}).config.account) ?? void 0,
	keepPrompt: (value) => `Signal account set (${value}). Keep it?`,
	validate: ({ value }) => normalizeSignalAccountInput(value) ? void 0 : INVALID_SIGNAL_ACCOUNT_ERROR,
	normalizeValue: ({ value }) => normalizeSignalAccountInput(value) ?? value
};
const signalCompletionNote = {
	title: "Signal next steps",
	lines: [
		"Link device with: signal-cli link -n \"OpenClaw\"",
		"Scan QR in Signal -> Linked Devices",
		`Then run: ${formatCliCommand("openclaw gateway call channels.status --params '{\"probe\":true}'")}`,
		`Docs: ${formatDocsLink("/signal", "signal")}`
	]
};
const signalSetupAdapter = createPatchedAccountSetupAdapter({
	channelKey: channel,
	validateInput: ({ input }) => {
		if (!input.signalNumber && !input.httpUrl && !input.httpHost && !input.httpPort && !input.cliPath) return "Signal requires --signal-number or --http-url/--http-host/--http-port/--cli-path.";
		return null;
	},
	buildPatch: (input) => buildSignalSetupPatch(input)
});
function createSignalSetupWizardProxy(loadWizard) {
	return {
		channel,
		status: {
			configuredLabel: "configured",
			unconfiguredLabel: "needs setup",
			configuredHint: "signal-cli found",
			unconfiguredHint: "signal-cli missing",
			configuredScore: 1,
			unconfiguredScore: 0,
			resolveConfigured: ({ cfg }) => listSignalAccountIds(cfg).some((accountId) => resolveSignalAccount({
				cfg,
				accountId
			}).configured),
			resolveStatusLines: async (params) => (await loadWizard()).signalSetupWizard.status.resolveStatusLines?.(params) ?? [],
			resolveSelectionHint: async (params) => await (await loadWizard()).signalSetupWizard.status.resolveSelectionHint?.(params),
			resolveQuickstartScore: async (params) => await (await loadWizard()).signalSetupWizard.status.resolveQuickstartScore?.(params)
		},
		prepare: async (params) => await (await loadWizard()).signalSetupWizard.prepare?.(params),
		credentials: [],
		textInputs: [createSignalCliPathTextInput(async (params) => {
			return await ((await loadWizard()).signalSetupWizard.textInputs?.find((entry) => entry.inputKey === "cliPath"))?.shouldPrompt?.(params) ?? false;
		}), signalNumberTextInput],
		completionNote: signalCompletionNote,
		dmPolicy: signalDmPolicy,
		disable: (cfg) => setSetupChannelEnabled(cfg, channel, false)
	};
}
//#endregion
export { signalNumberTextInput as a, signalDmPolicy as i, createSignalSetupWizardProxy as n, signalSetupAdapter as o, signalCompletionNote as r, createSignalCliPathTextInput as t };
