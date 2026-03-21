import "../../logger-ByBU4z1U.js";
import "../../paths-1qR_mW4i.js";
import "../../tmp-openclaw-dir-BDQ0wJ2G.js";
import "../../theme-BSXzMzAA.js";
import "../../globals-DqZvRoPX.js";
import "../../subsystem-MGyxt_Bl.js";
import "../../ansi-BPhP6LBZ.js";
import "../../utils-BMtC0Ocd.js";
import "../../agent-scope-B-OyGztR.js";
import "../../boundary-file-read-Y1cMjPlu.js";
import "../../logger-iZtdpoh6.js";
import "../../exec-CwhzW0JB.js";
import "../../workspace-Dns6NMt3.js";
import "../../registry-jBzBWMf6.js";
import "../../resolve-route-CUHslQlg.js";
import "../../secret-file-DRp-Ebe1.js";
import { n as definePluginEntry } from "../../core-TgQ7U3Ou.js";
//#region extensions/memory-core/index.ts
var memory_core_default = definePluginEntry({
	id: "memory-core",
	name: "Memory (Core)",
	description: "File-backed memory search tools and CLI",
	kind: "memory",
	register(api) {
		api.registerTool((ctx) => {
			const memorySearchTool = api.runtime.tools.createMemorySearchTool({
				config: ctx.config,
				agentSessionKey: ctx.sessionKey
			});
			const memoryGetTool = api.runtime.tools.createMemoryGetTool({
				config: ctx.config,
				agentSessionKey: ctx.sessionKey
			});
			if (!memorySearchTool || !memoryGetTool) return null;
			return [memorySearchTool, memoryGetTool];
		}, { names: ["memory_search", "memory_get"] });
		api.registerCli(({ program }) => {
			api.runtime.tools.registerMemoryCli(program);
		}, { commands: ["memory"] });
	}
});
//#endregion
export { memory_core_default as default };
