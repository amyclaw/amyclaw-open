import { t as createSubsystemLogger } from "./subsystem-MGyxt_Bl.js";
import { D as getActivePluginRegistry, Fn as loadOpenClawPlugins } from "./auth-profiles-Bc6TPi0n.js";
import { m as resolveDefaultAgentId, p as resolveAgentWorkspaceDir } from "./agent-scope-B-OyGztR.js";
import { s as loadConfig } from "./io-CezuVcrG.js";
import { n as resolveConfiguredChannelPluginIds, t as resolveChannelPluginIds } from "./channel-plugin-ids-odAH8XWC.js";
//#region src/cli/plugin-registry.ts
const log = createSubsystemLogger("plugins");
let pluginRegistryLoaded = "none";
function scopeRank(scope) {
	switch (scope) {
		case "none": return 0;
		case "configured-channels": return 1;
		case "channels": return 2;
		case "all": return 3;
	}
}
function ensurePluginRegistryLoaded(options) {
	const scope = options?.scope ?? "all";
	if (scopeRank(pluginRegistryLoaded) >= scopeRank(scope)) return;
	const active = getActivePluginRegistry();
	if (pluginRegistryLoaded === "none" && active && (active.plugins.length > 0 || active.channels.length > 0 || active.tools.length > 0)) {
		pluginRegistryLoaded = "all";
		return;
	}
	const config = loadConfig();
	const workspaceDir = resolveAgentWorkspaceDir(config, resolveDefaultAgentId(config));
	loadOpenClawPlugins({
		config,
		workspaceDir,
		logger: {
			info: (msg) => log.info(msg),
			warn: (msg) => log.warn(msg),
			error: (msg) => log.error(msg),
			debug: (msg) => log.debug(msg)
		},
		...scope === "configured-channels" ? { onlyPluginIds: resolveConfiguredChannelPluginIds({
			config,
			workspaceDir,
			env: process.env
		}) } : scope === "channels" ? { onlyPluginIds: resolveChannelPluginIds({
			config,
			workspaceDir,
			env: process.env
		}) } : {}
	});
	pluginRegistryLoaded = scope;
}
//#endregion
export { ensurePluginRegistryLoaded as t };
