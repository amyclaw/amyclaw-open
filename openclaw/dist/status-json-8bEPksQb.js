import "./redact-fatrROh9.js";
import "./errors-DOJWZqNo.js";
import "./logger-ByBU4z1U.js";
import { _ as resolveStateDir, o as resolveConfigPath } from "./paths-1qR_mW4i.js";
import "./tmp-openclaw-dir-BDQ0wJ2G.js";
import "./theme-BSXzMzAA.js";
import "./globals-DqZvRoPX.js";
import "./subsystem-MGyxt_Bl.js";
import "./ansi-BPhP6LBZ.js";
import "./boolean-D8Ha5nYV.js";
import "./env-DlREndPb.js";
import "./utils-BMtC0Ocd.js";
import "./model-selection-DJOYg7Dx.js";
import "./agent-scope-B-OyGztR.js";
import "./boundary-file-read-Y1cMjPlu.js";
import "./logger-iZtdpoh6.js";
import { r as runExec } from "./exec-CwhzW0JB.js";
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
import "./tailnet-KyAU6tj_.js";
import "./net-B_Iq_SVP.js";
import "./credentials-B7GJXbww.js";
import "./ports-D_2Jwnkx.js";
import "./ports-lsof-DiY6GaAf.js";
import "./message-channel-C4icaB2h.js";
import { L as hasPotentialConfiguredChannels } from "./lazy-runtime-07jXxTa3.js";
import "./method-scopes-BAswg77K.js";
import "./paths-BumENdHQ.js";
import "./call-x5WvUEsz.js";
import "./restart-stale-pids-OWmDUCi0.js";
import "./control-ui-shared-CfOOBRJE.js";
import "./runtime-parse-PVcg8TyI.js";
import "./launchd-5_vi_uEh.js";
import "./service-KUbBlQEC.js";
import "./systemd-D9tFr0-S.js";
import "./probe-CvVFHDON.js";
import "./probe-auth-D0yTXyIH.js";
import { a as resolveSharedMemoryStatusSnapshot, c as getNodeDaemonStatusSummary, h as pickGatewaySelfPresence, i as resolveMemoryPluginStatus, m as resolveOsSummary, n as buildTailscaleHttpsUrl, o as getAgentLocalStatuses, r as resolveGatewayProbeSnapshot, s as getDaemonStatusSummary, t as getStatusSummary } from "./status.summary-DGkrV6Gu.js";
import "./heartbeat-summary-Ds9eeKGN.js";
import { h as resolveUpdateChannelDisplay, p as normalizeUpdateChannel } from "./update-check-BnBXzhKb.js";
import "./node-service-CZeL9wna.js";
import { r as getUpdateCheckResult } from "./status.update-CzKpRFgc.js";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
//#region src/commands/status.scan.fast-json.ts
let pluginRegistryModulePromise;
let configIoModulePromise;
let commandSecretTargetsModulePromise;
let commandSecretGatewayModulePromise;
let memorySearchModulePromise;
let statusScanDepsRuntimeModulePromise;
function loadPluginRegistryModule() {
	pluginRegistryModulePromise ??= import("./plugin-registry-CBK7Y86U.js");
	return pluginRegistryModulePromise;
}
function loadConfigIoModule() {
	configIoModulePromise ??= import("./io-PRTmiALI.js");
	return configIoModulePromise;
}
function loadCommandSecretTargetsModule() {
	commandSecretTargetsModulePromise ??= import("./command-secret-targets-C9jWl6i3.js");
	return commandSecretTargetsModulePromise;
}
function loadCommandSecretGatewayModule() {
	commandSecretGatewayModulePromise ??= import("./command-secret-gateway-__V-GWJd.js");
	return commandSecretGatewayModulePromise;
}
function loadMemorySearchModule() {
	memorySearchModulePromise ??= import("./memory-search-Be0ehef9.js");
	return memorySearchModulePromise;
}
function loadStatusScanDepsRuntimeModule() {
	statusScanDepsRuntimeModulePromise ??= import("./status.scan.deps.runtime-DVFsqmfp.js");
	return statusScanDepsRuntimeModulePromise;
}
function shouldSkipMissingConfigFastPath() {
	return process.env.VITEST === "true" || process.env.VITEST_POOL_ID !== void 0 || false;
}
function resolveDefaultMemoryStorePath(agentId) {
	return path.join(resolveStateDir(process.env, os.homedir), "memory", `${agentId}.sqlite`);
}
async function resolveMemoryStatusSnapshot(params) {
	const { resolveMemorySearchConfig } = await loadMemorySearchModule();
	const { getMemorySearchManager } = await loadStatusScanDepsRuntimeModule();
	return await resolveSharedMemoryStatusSnapshot({
		cfg: params.cfg,
		agentStatus: params.agentStatus,
		memoryPlugin: params.memoryPlugin,
		resolveMemoryConfig: resolveMemorySearchConfig,
		getMemorySearchManager,
		requireDefaultStore: resolveDefaultMemoryStorePath
	});
}
async function readStatusSourceConfig() {
	if (!shouldSkipMissingConfigFastPath() && !existsSync(resolveConfigPath(process.env))) return {};
	const { readBestEffortConfig } = await loadConfigIoModule();
	return await readBestEffortConfig();
}
async function resolveStatusConfig(params) {
	if (!shouldSkipMissingConfigFastPath() && !existsSync(resolveConfigPath(process.env))) return {
		resolvedConfig: params.sourceConfig,
		diagnostics: []
	};
	const [{ resolveCommandSecretRefsViaGateway }, { getStatusCommandSecretTargetIds }] = await Promise.all([loadCommandSecretGatewayModule(), loadCommandSecretTargetsModule()]);
	return await resolveCommandSecretRefsViaGateway({
		config: params.sourceConfig,
		commandName: params.commandName,
		targetIds: getStatusCommandSecretTargetIds(),
		mode: "read_only_status"
	});
}
async function scanStatusJsonFast(opts, _runtime) {
	const loadedRaw = await readStatusSourceConfig();
	const { resolvedConfig: cfg, diagnostics: secretDiagnostics } = await resolveStatusConfig({
		sourceConfig: loadedRaw,
		commandName: "status --json"
	});
	if (hasPotentialConfiguredChannels(cfg)) {
		const { ensurePluginRegistryLoaded } = await loadPluginRegistryModule();
		ensurePluginRegistryLoaded({ scope: "configured-channels" });
	}
	const osSummary = resolveOsSummary();
	const tailscaleMode = cfg.gateway?.tailscale?.mode ?? "off";
	const updatePromise = getUpdateCheckResult({
		timeoutMs: opts.all ? 6500 : 2500,
		fetchGit: true,
		includeRegistry: true
	});
	const agentStatusPromise = getAgentLocalStatuses(cfg);
	const summaryPromise = getStatusSummary({
		config: cfg,
		sourceConfig: loadedRaw
	});
	const tailscaleDnsPromise = tailscaleMode === "off" ? Promise.resolve(null) : loadStatusScanDepsRuntimeModule().then(({ getTailnetHostname }) => getTailnetHostname((cmd, args) => runExec(cmd, args, {
		timeoutMs: 1200,
		maxBuffer: 2e5
	}))).catch(() => null);
	const gatewayProbePromise = resolveGatewayProbeSnapshot({
		cfg,
		opts
	});
	const [tailscaleDns, update, agentStatus, gatewaySnapshot, summary] = await Promise.all([
		tailscaleDnsPromise,
		updatePromise,
		agentStatusPromise,
		gatewayProbePromise,
		summaryPromise
	]);
	const tailscaleHttpsUrl = buildTailscaleHttpsUrl({
		tailscaleMode,
		tailscaleDns,
		controlUiBasePath: cfg.gateway?.controlUi?.basePath
	});
	const { gatewayConnection, remoteUrlMissing, gatewayMode, gatewayProbeAuth, gatewayProbeAuthWarning, gatewayProbe } = gatewaySnapshot;
	const gatewayReachable = gatewayProbe?.ok === true;
	const gatewaySelf = gatewayProbe?.presence ? pickGatewaySelfPresence(gatewayProbe.presence) : null;
	const memoryPlugin = resolveMemoryPluginStatus(cfg);
	return {
		cfg,
		sourceConfig: loadedRaw,
		secretDiagnostics,
		osSummary,
		tailscaleMode,
		tailscaleDns,
		tailscaleHttpsUrl,
		update,
		gatewayConnection,
		remoteUrlMissing,
		gatewayMode,
		gatewayProbeAuth,
		gatewayProbeAuthWarning,
		gatewayProbe,
		gatewayReachable,
		gatewaySelf,
		channelIssues: [],
		agentStatus,
		channels: {
			rows: [],
			details: []
		},
		summary,
		memory: await resolveMemoryStatusSnapshot({
			cfg,
			agentStatus,
			memoryPlugin
		}),
		memoryPlugin
	};
}
//#endregion
//#region src/commands/status-json.ts
let providerUsagePromise;
let securityAuditModulePromise;
let gatewayCallModulePromise;
function loadProviderUsage() {
	providerUsagePromise ??= import("./provider-usage-CBFuP8oT.js");
	return providerUsagePromise;
}
function loadSecurityAuditModule() {
	securityAuditModulePromise ??= import("./audit.runtime-nkaGl1DV.js");
	return securityAuditModulePromise;
}
function loadGatewayCallModule() {
	gatewayCallModulePromise ??= import("./call-DeA-y-R6.js");
	return gatewayCallModulePromise;
}
async function statusJsonCommand(opts, runtime) {
	const scan = await scanStatusJsonFast({
		timeoutMs: opts.timeoutMs,
		all: opts.all
	}, runtime);
	const securityAudit = await loadSecurityAuditModule().then(({ runSecurityAudit }) => runSecurityAudit({
		config: scan.cfg,
		sourceConfig: scan.sourceConfig,
		deep: false,
		includeFilesystem: true,
		includeChannelSecurity: true
	}));
	const usage = opts.usage ? await loadProviderUsage().then(({ loadProviderUsageSummary }) => loadProviderUsageSummary({ timeoutMs: opts.timeoutMs })) : void 0;
	const gatewayCall = opts.deep ? await loadGatewayCallModule().then((mod) => mod.callGateway) : null;
	const health = gatewayCall != null ? await gatewayCall({
		method: "health",
		params: { probe: true },
		timeoutMs: opts.timeoutMs,
		config: scan.cfg
	}).catch(() => void 0) : void 0;
	const lastHeartbeat = gatewayCall != null && scan.gatewayReachable ? await gatewayCall({
		method: "last-heartbeat",
		params: {},
		timeoutMs: opts.timeoutMs,
		config: scan.cfg
	}).catch(() => null) : null;
	const [daemon, nodeDaemon] = await Promise.all([getDaemonStatusSummary(), getNodeDaemonStatusSummary()]);
	const channelInfo = resolveUpdateChannelDisplay({
		configChannel: normalizeUpdateChannel(scan.cfg.update?.channel),
		installKind: scan.update.installKind,
		gitTag: scan.update.git?.tag ?? null,
		gitBranch: scan.update.git?.branch ?? null
	});
	runtime.log(JSON.stringify({
		...scan.summary,
		os: scan.osSummary,
		update: scan.update,
		updateChannel: channelInfo.channel,
		updateChannelSource: channelInfo.source,
		memory: scan.memory,
		memoryPlugin: scan.memoryPlugin,
		gateway: {
			mode: scan.gatewayMode,
			url: scan.gatewayConnection.url,
			urlSource: scan.gatewayConnection.urlSource,
			misconfigured: scan.remoteUrlMissing,
			reachable: scan.gatewayReachable,
			connectLatencyMs: scan.gatewayProbe?.connectLatencyMs ?? null,
			self: scan.gatewaySelf,
			error: scan.gatewayProbe?.error ?? null,
			authWarning: scan.gatewayProbeAuthWarning ?? null
		},
		gatewayService: daemon,
		nodeService: nodeDaemon,
		agents: scan.agentStatus,
		securityAudit,
		secretDiagnostics: scan.secretDiagnostics,
		...health || usage || lastHeartbeat ? {
			health,
			usage,
			lastHeartbeat
		} : {}
	}, null, 2));
}
//#endregion
export { statusJsonCommand };
