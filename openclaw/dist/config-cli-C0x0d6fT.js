import "./redact-fatrROh9.js";
import "./errors-DOJWZqNo.js";
import "./unhandled-rejections-BT0Rsc03.js";
import "./logger-ByBU4z1U.js";
import { t as CONFIG_PATH } from "./paths-1qR_mW4i.js";
import "./tmp-openclaw-dir-BDQ0wJ2G.js";
import { r as theme } from "./theme-BSXzMzAA.js";
import { n as info, t as danger, u as success } from "./globals-DqZvRoPX.js";
import { m as defaultRuntime } from "./subsystem-MGyxt_Bl.js";
import "./ansi-BPhP6LBZ.js";
import "./boolean-D8Ha5nYV.js";
import "./env-DlREndPb.js";
import "./warning-filter-Cg8_xqcp.js";
import { S as shortenHomePath } from "./utils-BMtC0Ocd.js";
import { t as formatDocsLink } from "./links-DA9sitJV.js";
import "./setup-binary-nB5GxsnS.js";
import "./auth-profiles-Bc6TPi0n.js";
import "./model-selection-DJOYg7Dx.js";
import "./agent-scope-B-OyGztR.js";
import { i as isBlockedObjectKey } from "./account-id-O4Og6DrK.js";
import "./boundary-file-read-Y1cMjPlu.js";
import "./logger-iZtdpoh6.js";
import "./exec-CwhzW0JB.js";
import "./workspace-Dns6NMt3.js";
import { d as readConfigFileSnapshot, g as writeConfigFile } from "./io-CezuVcrG.js";
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
import { t as formatCliCommand } from "./command-format-C8aJknFW.js";
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
import { q as OLLAMA_DEFAULT_BASE_URL } from "./provider-models-Cym0TctV.js";
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
import { a as normalizeConfigIssues, n as formatConfigIssueLines } from "./issue-format-i6sEuV4a.js";
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
import "./cli-utils-FHeUZLsT.js";
import "./help-format-1yV2Xzq7.js";
import "./progress-B4roBB_B.js";
import "./gateway-runtime-50-32dyb.js";
import { t as redactConfigObject } from "./redact-snapshot-DAHiDTMK.js";
import JSON5 from "json5";
//#region src/cli/config-cli.ts
const OLLAMA_API_KEY_PATH = [
	"models",
	"providers",
	"ollama",
	"apiKey"
];
const OLLAMA_PROVIDER_PATH = [
	"models",
	"providers",
	"ollama"
];
function isIndexSegment(raw) {
	return /^[0-9]+$/.test(raw);
}
function parsePath(raw) {
	const trimmed = raw.trim();
	if (!trimmed) return [];
	const parts = [];
	let current = "";
	let i = 0;
	while (i < trimmed.length) {
		const ch = trimmed[i];
		if (ch === "\\") {
			const next = trimmed[i + 1];
			if (next) current += next;
			i += 2;
			continue;
		}
		if (ch === ".") {
			if (current) parts.push(current);
			current = "";
			i += 1;
			continue;
		}
		if (ch === "[") {
			if (current) parts.push(current);
			current = "";
			const close = trimmed.indexOf("]", i);
			if (close === -1) throw new Error(`Invalid path (missing "]"): ${raw}`);
			const inside = trimmed.slice(i + 1, close).trim();
			if (!inside) throw new Error(`Invalid path (empty "[]"): ${raw}`);
			parts.push(inside);
			i = close + 1;
			continue;
		}
		current += ch;
		i += 1;
	}
	if (current) parts.push(current);
	return parts.map((part) => part.trim()).filter(Boolean);
}
function parseValue(raw, opts) {
	const trimmed = raw.trim();
	if (opts.strictJson) try {
		return JSON5.parse(trimmed);
	} catch (err) {
		throw new Error(`Failed to parse JSON5 value: ${String(err)}`, { cause: err });
	}
	try {
		return JSON5.parse(trimmed);
	} catch {
		return raw;
	}
}
function hasOwnPathKey(value, key) {
	return Object.prototype.hasOwnProperty.call(value, key);
}
function formatDoctorHint(message) {
	return `Run \`${formatCliCommand("openclaw doctor")}\` ${message}`;
}
function validatePathSegments(path) {
	for (const segment of path) if (!isIndexSegment(segment) && isBlockedObjectKey(segment)) throw new Error(`Invalid path segment: ${segment}`);
}
function getAtPath(root, path) {
	let current = root;
	for (const segment of path) {
		if (!current || typeof current !== "object") return { found: false };
		if (Array.isArray(current)) {
			if (!isIndexSegment(segment)) return { found: false };
			const index = Number.parseInt(segment, 10);
			if (!Number.isFinite(index) || index < 0 || index >= current.length) return { found: false };
			current = current[index];
			continue;
		}
		const record = current;
		if (!hasOwnPathKey(record, segment)) return { found: false };
		current = record[segment];
	}
	return {
		found: true,
		value: current
	};
}
function setAtPath(root, path, value) {
	let current = root;
	for (let i = 0; i < path.length - 1; i += 1) {
		const segment = path[i];
		const next = path[i + 1];
		const nextIsIndex = Boolean(next && isIndexSegment(next));
		if (Array.isArray(current)) {
			if (!isIndexSegment(segment)) throw new Error(`Expected numeric index for array segment "${segment}"`);
			const index = Number.parseInt(segment, 10);
			const existing = current[index];
			if (!existing || typeof existing !== "object") current[index] = nextIsIndex ? [] : {};
			current = current[index];
			continue;
		}
		if (!current || typeof current !== "object") throw new Error(`Cannot traverse into "${segment}" (not an object)`);
		const record = current;
		const existing = hasOwnPathKey(record, segment) ? record[segment] : void 0;
		if (!existing || typeof existing !== "object") record[segment] = nextIsIndex ? [] : {};
		current = record[segment];
	}
	const last = path[path.length - 1];
	if (Array.isArray(current)) {
		if (!isIndexSegment(last)) throw new Error(`Expected numeric index for array segment "${last}"`);
		const index = Number.parseInt(last, 10);
		current[index] = value;
		return;
	}
	if (!current || typeof current !== "object") throw new Error(`Cannot set "${last}" (parent is not an object)`);
	current[last] = value;
}
function unsetAtPath(root, path) {
	let current = root;
	for (let i = 0; i < path.length - 1; i += 1) {
		const segment = path[i];
		if (!current || typeof current !== "object") return false;
		if (Array.isArray(current)) {
			if (!isIndexSegment(segment)) return false;
			const index = Number.parseInt(segment, 10);
			if (!Number.isFinite(index) || index < 0 || index >= current.length) return false;
			current = current[index];
			continue;
		}
		const record = current;
		if (!hasOwnPathKey(record, segment)) return false;
		current = record[segment];
	}
	const last = path[path.length - 1];
	if (Array.isArray(current)) {
		if (!isIndexSegment(last)) return false;
		const index = Number.parseInt(last, 10);
		if (!Number.isFinite(index) || index < 0 || index >= current.length) return false;
		current.splice(index, 1);
		return true;
	}
	if (!current || typeof current !== "object") return false;
	const record = current;
	if (!hasOwnPathKey(record, last)) return false;
	delete record[last];
	return true;
}
async function loadValidConfig(runtime = defaultRuntime) {
	const snapshot = await readConfigFileSnapshot();
	if (snapshot.valid) return snapshot;
	runtime.error(`Config invalid at ${shortenHomePath(snapshot.path)}.`);
	for (const line of formatConfigIssueLines(snapshot.issues, "-", { normalizeRoot: true })) runtime.error(line);
	runtime.error(formatDoctorHint("to repair, then retry."));
	runtime.exit(1);
	return snapshot;
}
function parseRequiredPath(path) {
	const parsedPath = parsePath(path);
	if (parsedPath.length === 0) throw new Error("Path is empty.");
	validatePathSegments(parsedPath);
	return parsedPath;
}
function pathEquals(path, expected) {
	return path.length === expected.length && path.every((segment, index) => segment === expected[index]);
}
function ensureValidOllamaProviderForApiKeySet(root, path) {
	if (!pathEquals(path, OLLAMA_API_KEY_PATH)) return;
	if (getAtPath(root, OLLAMA_PROVIDER_PATH).found) return;
	setAtPath(root, OLLAMA_PROVIDER_PATH, {
		baseUrl: OLLAMA_DEFAULT_BASE_URL,
		api: "ollama",
		models: []
	});
}
async function runConfigGet(opts) {
	const runtime = opts.runtime ?? defaultRuntime;
	try {
		const parsedPath = parseRequiredPath(opts.path);
		const res = getAtPath(redactConfigObject((await loadValidConfig(runtime)).config), parsedPath);
		if (!res.found) {
			runtime.error(danger(`Config path not found: ${opts.path}`));
			runtime.exit(1);
			return;
		}
		if (opts.json) {
			runtime.log(JSON.stringify(res.value ?? null, null, 2));
			return;
		}
		if (typeof res.value === "string" || typeof res.value === "number" || typeof res.value === "boolean") {
			runtime.log(String(res.value));
			return;
		}
		runtime.log(JSON.stringify(res.value ?? null, null, 2));
	} catch (err) {
		runtime.error(danger(String(err)));
		runtime.exit(1);
	}
}
async function runConfigUnset(opts) {
	const runtime = opts.runtime ?? defaultRuntime;
	try {
		const parsedPath = parseRequiredPath(opts.path);
		const snapshot = await loadValidConfig(runtime);
		const next = structuredClone(snapshot.resolved);
		if (!unsetAtPath(next, parsedPath)) {
			runtime.error(danger(`Config path not found: ${opts.path}`));
			runtime.exit(1);
			return;
		}
		await writeConfigFile(next, { unsetPaths: [parsedPath] });
		runtime.log(info(`Removed ${opts.path}. Restart the gateway to apply.`));
	} catch (err) {
		runtime.error(danger(String(err)));
		runtime.exit(1);
	}
}
async function runConfigFile(opts) {
	const runtime = opts.runtime ?? defaultRuntime;
	try {
		const snapshot = await readConfigFileSnapshot();
		runtime.log(shortenHomePath(snapshot.path));
	} catch (err) {
		runtime.error(danger(String(err)));
		runtime.exit(1);
	}
}
async function runConfigValidate(opts = {}) {
	const runtime = opts.runtime ?? defaultRuntime;
	let outputPath = CONFIG_PATH ?? "openclaw.json";
	try {
		const snapshot = await readConfigFileSnapshot();
		outputPath = snapshot.path;
		const shortPath = shortenHomePath(outputPath);
		if (!snapshot.exists) {
			if (opts.json) runtime.log(JSON.stringify({
				valid: false,
				path: outputPath,
				error: "file not found"
			}));
			else runtime.error(danger(`Config file not found: ${shortPath}`));
			runtime.exit(1);
			return;
		}
		if (!snapshot.valid) {
			const issues = normalizeConfigIssues(snapshot.issues);
			if (opts.json) runtime.log(JSON.stringify({
				valid: false,
				path: outputPath,
				issues
			}, null, 2));
			else {
				runtime.error(danger(`Config invalid at ${shortPath}:`));
				for (const line of formatConfigIssueLines(issues, danger("×"), { normalizeRoot: true })) runtime.error(`  ${line}`);
				runtime.error("");
				runtime.error(formatDoctorHint("to repair, or fix the keys above manually."));
			}
			runtime.exit(1);
			return;
		}
		if (opts.json) runtime.log(JSON.stringify({
			valid: true,
			path: outputPath
		}));
		else runtime.log(success(`Config valid: ${shortPath}`));
	} catch (err) {
		if (opts.json) runtime.log(JSON.stringify({
			valid: false,
			path: outputPath,
			error: String(err)
		}));
		else runtime.error(danger(`Config validation error: ${String(err)}`));
		runtime.exit(1);
	}
}
function registerConfigCli(program) {
	const cmd = program.command("config").description("Non-interactive config helpers (get/set/unset/file/validate). Run without subcommand for guided setup.").addHelpText("after", () => `\n${theme.muted("Docs:")} ${formatDocsLink("/cli/config", "docs.openclaw.ai/cli/config")}\n`).option("--section <section>", "Configuration sections for guided setup (repeatable). Use with no subcommand.", (value, previous) => [...previous, value], []).action(async (opts) => {
		const { configureCommandFromSectionsArg } = await import("./configure-BXqCS0kW.js");
		await configureCommandFromSectionsArg(opts.section, defaultRuntime);
	});
	cmd.command("get").description("Get a config value by dot path").argument("<path>", "Config path (dot or bracket notation)").option("--json", "Output JSON", false).action(async (path, opts) => {
		await runConfigGet({
			path,
			json: Boolean(opts.json)
		});
	});
	cmd.command("set").description("Set a config value by dot path").argument("<path>", "Config path (dot or bracket notation)").argument("<value>", "Value (JSON5 or raw string)").option("--strict-json", "Strict JSON5 parsing (error instead of raw string fallback)", false).option("--json", "Legacy alias for --strict-json", false).action(async (path, value, opts) => {
		try {
			const parsedPath = parseRequiredPath(path);
			const parsedValue = parseValue(value, { strictJson: Boolean(opts.strictJson || opts.json) });
			const snapshot = await loadValidConfig();
			const next = structuredClone(snapshot.resolved);
			ensureValidOllamaProviderForApiKeySet(next, parsedPath);
			setAtPath(next, parsedPath, parsedValue);
			await writeConfigFile(next);
			defaultRuntime.log(info(`Updated ${path}. Restart the gateway to apply.`));
		} catch (err) {
			defaultRuntime.error(danger(String(err)));
			defaultRuntime.exit(1);
		}
	});
	cmd.command("unset").description("Remove a config value by dot path").argument("<path>", "Config path (dot or bracket notation)").action(async (path) => {
		await runConfigUnset({ path });
	});
	cmd.command("file").description("Print the active config file path").action(async () => {
		await runConfigFile({});
	});
	cmd.command("validate").description("Validate the current config against the schema without starting the gateway").option("--json", "Output validation result as JSON", false).action(async (opts) => {
		await runConfigValidate({ json: Boolean(opts.json) });
	});
}
//#endregion
export { registerConfigCli, runConfigGet, runConfigUnset };
