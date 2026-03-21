import "./redact-fatrROh9.js";
import "./errors-DOJWZqNo.js";
import "./unhandled-rejections-BT0Rsc03.js";
import "./logger-ByBU4z1U.js";
import "./paths-1qR_mW4i.js";
import "./tmp-openclaw-dir-BDQ0wJ2G.js";
import { r as theme } from "./theme-BSXzMzAA.js";
import { s as setVerbose, t as danger } from "./globals-DqZvRoPX.js";
import { m as defaultRuntime } from "./subsystem-MGyxt_Bl.js";
import "./ansi-BPhP6LBZ.js";
import "./boolean-D8Ha5nYV.js";
import "./env-DlREndPb.js";
import "./warning-filter-Cg8_xqcp.js";
import "./utils-BMtC0Ocd.js";
import { t as formatDocsLink } from "./links-DA9sitJV.js";
import { t as hasExplicitOptions } from "./command-options-CYhpCq_H.js";
import "./setup-binary-nB5GxsnS.js";
import { E as normalizeChannelId, MT as resolveChannelDefaultAccountId, _u as resolveMessageChannelSelection, w as getChannelPlugin } from "./auth-profiles-Bc6TPi0n.js";
import "./model-selection-DJOYg7Dx.js";
import "./agent-scope-B-OyGztR.js";
import "./boundary-file-read-Y1cMjPlu.js";
import "./logger-iZtdpoh6.js";
import "./exec-CwhzW0JB.js";
import "./workspace-Dns6NMt3.js";
import { s as loadConfig } from "./io-CezuVcrG.js";
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
import { n as runCommandWithRuntime } from "./cli-utils-FHeUZLsT.js";
import { t as formatHelpExamples } from "./help-format-1yV2Xzq7.js";
import "./progress-B4roBB_B.js";
import "./gateway-runtime-50-32dyb.js";
import "./channel-plugin-ids-odAH8XWC.js";
import "./plugin-registry-CKeHk89Z.js";
import { t as formatCliChannelOptions } from "./channel-options-CIFxaOvg.js";
//#region src/cli/channel-auth.ts
async function resolveChannelPluginForMode(opts, mode, cfg) {
	const explicitChannel = opts.channel?.trim();
	const channelInput = explicitChannel ? explicitChannel : (await resolveMessageChannelSelection({ cfg })).channel;
	const channelId = normalizeChannelId(channelInput);
	if (!channelId) throw new Error(`Unsupported channel: ${channelInput}`);
	const plugin = getChannelPlugin(channelId);
	if (!(mode === "login" ? Boolean(plugin?.auth?.login) : Boolean(plugin?.gateway?.logoutAccount))) throw new Error(`Channel ${channelId} does not support ${mode}`);
	return {
		channelInput,
		channelId,
		plugin
	};
}
function resolveAccountContext(plugin, opts, cfg) {
	return { accountId: opts.account?.trim() || resolveChannelDefaultAccountId({
		plugin,
		cfg
	}) };
}
async function runChannelLogin(opts, runtime = defaultRuntime) {
	const cfg = loadConfig();
	const { channelInput, plugin } = await resolveChannelPluginForMode(opts, "login", cfg);
	const login = plugin.auth?.login;
	if (!login) throw new Error(`Channel ${channelInput} does not support login`);
	setVerbose(Boolean(opts.verbose));
	const { accountId } = resolveAccountContext(plugin, opts, cfg);
	await login({
		cfg,
		accountId,
		runtime,
		verbose: Boolean(opts.verbose),
		channelInput
	});
}
async function runChannelLogout(opts, runtime = defaultRuntime) {
	const cfg = loadConfig();
	const { channelInput, plugin } = await resolveChannelPluginForMode(opts, "logout", cfg);
	const logoutAccount = plugin.gateway?.logoutAccount;
	if (!logoutAccount) throw new Error(`Channel ${channelInput} does not support logout`);
	const { accountId } = resolveAccountContext(plugin, opts, cfg);
	await logoutAccount({
		cfg,
		accountId,
		account: plugin.config.resolveAccount(cfg, accountId),
		runtime
	});
}
//#endregion
//#region src/cli/channels-cli.ts
const optionNamesAdd = [
	"channel",
	"account",
	"name",
	"token",
	"privateKey",
	"tokenFile",
	"botToken",
	"appToken",
	"signalNumber",
	"cliPath",
	"dbPath",
	"service",
	"region",
	"authDir",
	"httpUrl",
	"httpHost",
	"httpPort",
	"webhookPath",
	"webhookUrl",
	"audienceType",
	"audience",
	"useEnv",
	"homeserver",
	"userId",
	"accessToken",
	"password",
	"deviceName",
	"initialSyncLimit",
	"ship",
	"url",
	"relayUrls",
	"code",
	"groupChannels",
	"dmAllowlist",
	"autoDiscoverChannels"
];
const optionNamesRemove = [
	"channel",
	"account",
	"delete"
];
function runChannelsCommand(action) {
	return runCommandWithRuntime(defaultRuntime, action);
}
function runChannelsCommandWithDanger(action, label) {
	return runCommandWithRuntime(defaultRuntime, action, (err) => {
		defaultRuntime.error(danger(`${label}: ${String(err)}`));
		defaultRuntime.exit(1);
	});
}
function registerChannelsCli(program) {
	const channelNames = formatCliChannelOptions();
	const channels = program.command("channels").description("Manage connected chat channels and accounts").addHelpText("after", () => `\n${theme.heading("Examples:")}\n${formatHelpExamples([
		["openclaw channels list", "List configured channels and auth profiles."],
		["openclaw channels status --probe", "Run channel status checks and probes."],
		["openclaw channels add --channel telegram --token <token>", "Add or update a channel account non-interactively."],
		["openclaw channels login --channel whatsapp", "Link a WhatsApp Web account."]
	])}\n\n${theme.muted("Docs:")} ${formatDocsLink("/cli/channels", "docs.openclaw.ai/cli/channels")}\n`);
	channels.command("list").description("List configured channels + auth profiles").option("--no-usage", "Skip model provider usage/quota snapshots").option("--json", "Output JSON", false).action(async (opts) => {
		await runChannelsCommand(async () => {
			const { channelsListCommand } = await import("./channels-D3trVB_h.js");
			await channelsListCommand(opts, defaultRuntime);
		});
	});
	channels.command("status").description("Show gateway channel status (use status --deep for local)").option("--probe", "Probe channel credentials", false).option("--timeout <ms>", "Timeout in ms", "10000").option("--json", "Output JSON", false).action(async (opts) => {
		await runChannelsCommand(async () => {
			const { channelsStatusCommand } = await import("./channels-D3trVB_h.js");
			await channelsStatusCommand(opts, defaultRuntime);
		});
	});
	channels.command("capabilities").description("Show provider capabilities (intents/scopes + supported features)").option("--channel <name>", `Channel (${formatCliChannelOptions(["all"])})`).option("--account <id>", "Account id (only with --channel)").option("--target <dest>", "Channel target for permission audit (Discord channel:<id>)").option("--timeout <ms>", "Timeout in ms", "10000").option("--json", "Output JSON", false).action(async (opts) => {
		await runChannelsCommand(async () => {
			const { channelsCapabilitiesCommand } = await import("./channels-D3trVB_h.js");
			await channelsCapabilitiesCommand(opts, defaultRuntime);
		});
	});
	channels.command("resolve").description("Resolve channel/user names to IDs").argument("<entries...>", "Entries to resolve (names or ids)").option("--channel <name>", `Channel (${channelNames})`).option("--account <id>", "Account id (accountId)").option("--kind <kind>", "Target kind (auto|user|group)", "auto").option("--json", "Output JSON", false).action(async (entries, opts) => {
		await runChannelsCommand(async () => {
			const { channelsResolveCommand } = await import("./channels-D3trVB_h.js");
			await channelsResolveCommand({
				channel: opts.channel,
				account: opts.account,
				kind: opts.kind,
				json: Boolean(opts.json),
				entries: Array.isArray(entries) ? entries : [String(entries)]
			}, defaultRuntime);
		});
	});
	channels.command("logs").description("Show recent channel logs from the gateway log file").option("--channel <name>", `Channel (${formatCliChannelOptions(["all"])})`, "all").option("--lines <n>", "Number of lines (default: 200)", "200").option("--json", "Output JSON", false).action(async (opts) => {
		await runChannelsCommand(async () => {
			const { channelsLogsCommand } = await import("./channels-D3trVB_h.js");
			await channelsLogsCommand(opts, defaultRuntime);
		});
	});
	channels.command("add").description("Add or update a channel account").option("--channel <name>", `Channel (${channelNames})`).option("--account <id>", "Account id (default when omitted)").option("--name <name>", "Display name for this account").option("--token <token>", "Bot token (Telegram/Discord)").option("--private-key <key>", "Nostr private key (nsec... or hex)").option("--token-file <path>", "Bot token file (Telegram)").option("--bot-token <token>", "Slack bot token (xoxb-...)").option("--app-token <token>", "Slack app token (xapp-...)").option("--signal-number <e164>", "Signal account number (E.164)").option("--cli-path <path>", "CLI path (signal-cli or imsg)").option("--db-path <path>", "iMessage database path").option("--service <service>", "iMessage service (imessage|sms|auto)").option("--region <region>", "iMessage region (for SMS)").option("--auth-dir <path>", "WhatsApp auth directory override").option("--http-url <url>", "Signal HTTP daemon base URL").option("--http-host <host>", "Signal HTTP host").option("--http-port <port>", "Signal HTTP port").option("--webhook-path <path>", "Webhook path (Google Chat/BlueBubbles)").option("--webhook-url <url>", "Google Chat webhook URL").option("--audience-type <type>", "Google Chat audience type (app-url|project-number)").option("--audience <value>", "Google Chat audience value (app URL or project number)").option("--homeserver <url>", "Matrix homeserver URL").option("--user-id <id>", "Matrix user ID").option("--access-token <token>", "Matrix access token").option("--password <password>", "Matrix password").option("--device-name <name>", "Matrix device name").option("--initial-sync-limit <n>", "Matrix initial sync limit").option("--ship <ship>", "Tlon ship name (~sampel-palnet)").option("--url <url>", "Tlon ship URL").option("--relay-urls <list>", "Nostr relay URLs (comma-separated)").option("--code <code>", "Tlon login code").option("--group-channels <list>", "Tlon group channels (comma-separated)").option("--dm-allowlist <list>", "Tlon DM allowlist (comma-separated ships)").option("--auto-discover-channels", "Tlon auto-discover group channels").option("--no-auto-discover-channels", "Disable Tlon auto-discovery").option("--use-env", "Use env token (default account only)", false).action(async (opts, command) => {
		await runChannelsCommand(async () => {
			const { channelsAddCommand } = await import("./channels-D3trVB_h.js");
			await channelsAddCommand(opts, defaultRuntime, { hasFlags: hasExplicitOptions(command, optionNamesAdd) });
		});
	});
	channels.command("remove").description("Disable or delete a channel account").option("--channel <name>", `Channel (${channelNames})`).option("--account <id>", "Account id (default when omitted)").option("--delete", "Delete config entries (no prompt)", false).action(async (opts, command) => {
		await runChannelsCommand(async () => {
			const { channelsRemoveCommand } = await import("./channels-D3trVB_h.js");
			await channelsRemoveCommand(opts, defaultRuntime, { hasFlags: hasExplicitOptions(command, optionNamesRemove) });
		});
	});
	channels.command("login").description("Link a channel account (if supported)").option("--channel <channel>", "Channel alias (auto when only one is configured)").option("--account <id>", "Account id (accountId)").option("--verbose", "Verbose connection logs", false).action(async (opts) => {
		await runChannelsCommandWithDanger(async () => {
			await runChannelLogin({
				channel: opts.channel,
				account: opts.account,
				verbose: Boolean(opts.verbose)
			}, defaultRuntime);
		}, "Channel login failed");
	});
	channels.command("logout").description("Log out of a channel session (if supported)").option("--channel <channel>", "Channel alias (auto when only one is configured)").option("--account <id>", "Account id (accountId)").action(async (opts) => {
		await runChannelsCommandWithDanger(async () => {
			await runChannelLogout({
				channel: opts.channel,
				account: opts.account
			}, defaultRuntime);
		}, "Channel logout failed");
	});
}
//#endregion
export { registerChannelsCli };
