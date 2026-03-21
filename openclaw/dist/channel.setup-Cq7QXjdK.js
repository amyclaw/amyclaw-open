import { r as buildChannelConfigSchema } from "./config-schema-GQ6uWjXe.js";
import { n as lineSetupWizard, r as lineSetupAdapter, t as LineConfigSchema } from "./line-DF1xtW_N.js";
import { i as resolveLineAccount, r as resolveDefaultLineAccountId, t as listLineAccountIds } from "./accounts-CXqzdDJl.js";
//#region extensions/line/src/channel.setup.ts
const meta = {
	id: "line",
	label: "LINE",
	selectionLabel: "LINE (Messaging API)",
	detailLabel: "LINE Bot",
	docsPath: "/channels/line",
	docsLabel: "line",
	blurb: "LINE Messaging API bot for Japan/Taiwan/Thailand markets.",
	systemImage: "message.fill"
};
const normalizeLineAllowFrom = (entry) => entry.replace(/^line:(?:user:)?/i, "");
const lineSetupPlugin = {
	id: "line",
	meta: {
		...meta,
		quickstartAllowFrom: true
	},
	capabilities: {
		chatTypes: ["direct", "group"],
		reactions: false,
		threads: false,
		media: true,
		nativeCommands: false,
		blockStreaming: true
	},
	reload: { configPrefixes: ["channels.line"] },
	configSchema: buildChannelConfigSchema(LineConfigSchema),
	config: {
		listAccountIds: (cfg) => listLineAccountIds(cfg),
		resolveAccount: (cfg, accountId) => resolveLineAccount({
			cfg,
			accountId: accountId ?? void 0
		}),
		defaultAccountId: (cfg) => resolveDefaultLineAccountId(cfg),
		isConfigured: (account) => Boolean(account.channelAccessToken?.trim() && account.channelSecret?.trim()),
		describeAccount: (account) => ({
			accountId: account.accountId,
			name: account.name,
			enabled: account.enabled,
			configured: Boolean(account.channelAccessToken?.trim() && account.channelSecret?.trim()),
			tokenSource: account.tokenSource ?? void 0
		}),
		resolveAllowFrom: ({ cfg, accountId }) => resolveLineAccount({
			cfg,
			accountId: accountId ?? void 0
		}).config.allowFrom,
		formatAllowFrom: ({ allowFrom }) => allowFrom.map((entry) => String(entry).trim()).filter(Boolean).map((entry) => normalizeLineAllowFrom(entry))
	},
	setupWizard: lineSetupWizard,
	setup: lineSetupAdapter
};
//#endregion
export { lineSetupPlugin as t };
