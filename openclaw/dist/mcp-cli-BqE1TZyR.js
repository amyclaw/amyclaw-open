import "./logger-ByBU4z1U.js";
import "./paths-1qR_mW4i.js";
import "./tmp-openclaw-dir-BDQ0wJ2G.js";
import "./theme-BSXzMzAA.js";
import "./globals-DqZvRoPX.js";
import { m as defaultRuntime } from "./subsystem-MGyxt_Bl.js";
import "./ansi-BPhP6LBZ.js";
import "./boolean-D8Ha5nYV.js";
import "./env-DlREndPb.js";
import "./utils-BMtC0Ocd.js";
import "./model-selection-DJOYg7Dx.js";
import "./agent-scope-B-OyGztR.js";
import "./boundary-file-read-Y1cMjPlu.js";
import "./logger-iZtdpoh6.js";
import "./exec-CwhzW0JB.js";
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
import { a as unsetConfiguredMcpServer, i as setConfiguredMcpServer, n as listConfiguredMcpServers, t as parseConfigValue } from "./config-value-Cb6kcdav.js";
//#region src/cli/mcp-cli.ts
function fail(message) {
	defaultRuntime.error(message);
	defaultRuntime.exit(1);
	throw new Error(message);
}
function printJson(value) {
	defaultRuntime.log(JSON.stringify(value, null, 2));
}
function registerMcpCli(program) {
	const mcp = program.command("mcp").description("Manage OpenClaw MCP server config");
	mcp.command("list").description("List configured MCP servers").option("--json", "Print JSON").action(async (opts) => {
		const loaded = await listConfiguredMcpServers();
		if (!loaded.ok) fail(loaded.error);
		if (opts.json) {
			printJson(loaded.mcpServers);
			return;
		}
		const names = Object.keys(loaded.mcpServers).toSorted();
		if (names.length === 0) {
			defaultRuntime.log(`No MCP servers configured in ${loaded.path}.`);
			return;
		}
		defaultRuntime.log(`MCP servers (${loaded.path}):`);
		for (const name of names) defaultRuntime.log(`- ${name}`);
	});
	mcp.command("show").description("Show one configured MCP server or the full MCP config").argument("[name]", "MCP server name").option("--json", "Print JSON").action(async (name, opts) => {
		const loaded = await listConfiguredMcpServers();
		if (!loaded.ok) fail(loaded.error);
		const value = name ? loaded.mcpServers[name] : loaded.mcpServers;
		if (name && !value) fail(`No MCP server named "${name}" in ${loaded.path}.`);
		if (opts.json) {
			printJson(value ?? {});
			return;
		}
		if (name) defaultRuntime.log(`MCP server "${name}" (${loaded.path}):`);
		else defaultRuntime.log(`MCP servers (${loaded.path}):`);
		printJson(value ?? {});
	});
	mcp.command("set").description("Set one configured MCP server from a JSON object").argument("<name>", "MCP server name").argument("<value>", "JSON object, for example {\"command\":\"uvx\",\"args\":[\"context7-mcp\"]}").action(async (name, rawValue) => {
		const parsed = parseConfigValue(rawValue);
		if (parsed.error) fail(parsed.error);
		const result = await setConfiguredMcpServer({
			name,
			server: parsed.value
		});
		if (!result.ok) fail(result.error);
		defaultRuntime.log(`Saved MCP server "${name}" to ${result.path}.`);
	});
	mcp.command("unset").description("Remove one configured MCP server").argument("<name>", "MCP server name").action(async (name) => {
		const result = await unsetConfiguredMcpServer({ name });
		if (!result.ok) fail(result.error);
		if (!result.removed) fail(`No MCP server named "${name}" in ${result.path}.`);
		defaultRuntime.log(`Removed MCP server "${name}" from ${result.path}.`);
	});
}
//#endregion
export { registerMcpCli };
