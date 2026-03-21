import { N as shouldMigrateStateFromPath } from "./logger-ByBU4z1U.js";
import "./paths-1qR_mW4i.js";
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
import "./exec-CwhzW0JB.js";
import "./workspace-Dns6NMt3.js";
import { d as readConfigFileSnapshot } from "./io-CezuVcrG.js";
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
//#region src/cli/program/config-guard.ts
const ALLOWED_INVALID_COMMANDS = new Set([
	"doctor",
	"logs",
	"health",
	"help",
	"status"
]);
const ALLOWED_INVALID_GATEWAY_SUBCOMMANDS = new Set([
	"status",
	"probe",
	"health",
	"discover",
	"call",
	"install",
	"uninstall",
	"start",
	"stop",
	"restart"
]);
let didRunDoctorConfigFlow = false;
let configSnapshotPromise = null;
function resetConfigGuardStateForTests() {
	didRunDoctorConfigFlow = false;
	configSnapshotPromise = null;
}
async function getConfigSnapshot() {
	if (process.env.VITEST === "true") return readConfigFileSnapshot();
	configSnapshotPromise ??= readConfigFileSnapshot();
	return configSnapshotPromise;
}
async function ensureConfigReady(params) {
	const commandPath = params.commandPath ?? [];
	if (!didRunDoctorConfigFlow && shouldMigrateStateFromPath(commandPath)) {
		didRunDoctorConfigFlow = true;
		const runDoctorConfigFlow = async () => (await import("./doctor-config-flow-CcFX6WV6.js")).loadAndMaybeMigrateDoctorConfig({
			options: { nonInteractive: true },
			confirm: async () => false
		});
		if (!params.suppressDoctorStdout) await runDoctorConfigFlow();
		else {
			const originalStdoutWrite = process.stdout.write.bind(process.stdout);
			const originalSuppressNotes = process.env.OPENCLAW_SUPPRESS_NOTES;
			process.stdout.write = (() => true);
			process.env.OPENCLAW_SUPPRESS_NOTES = "1";
			try {
				await runDoctorConfigFlow();
			} finally {
				process.stdout.write = originalStdoutWrite;
				if (originalSuppressNotes === void 0) delete process.env.OPENCLAW_SUPPRESS_NOTES;
				else process.env.OPENCLAW_SUPPRESS_NOTES = originalSuppressNotes;
			}
		}
	}
	const snapshot = await getConfigSnapshot();
	const commandName = commandPath[0];
	const subcommandName = commandPath[1];
	const allowInvalid = commandName ? ALLOWED_INVALID_COMMANDS.has(commandName) || commandName === "gateway" && subcommandName && ALLOWED_INVALID_GATEWAY_SUBCOMMANDS.has(subcommandName) : false;
	const { formatConfigIssueLines } = await import("./issue-format-CqTp9Yal.js");
	const issues = snapshot.exists && !snapshot.valid ? formatConfigIssueLines(snapshot.issues, "-", { normalizeRoot: true }) : [];
	const legacyIssues = snapshot.legacyIssues.length > 0 ? formatConfigIssueLines(snapshot.legacyIssues, "-") : [];
	if (!(snapshot.exists && !snapshot.valid)) return;
	const [{ colorize, isRich, theme }, { shortenHomePath }, { formatCliCommand }] = await Promise.all([
		import("./theme-DNo_JIr-.js"),
		import("./utils-83hUr4pu.js"),
		import("./command-format-Cou5M9SR.js")
	]);
	const rich = isRich();
	const muted = (value) => colorize(rich, theme.muted, value);
	const error = (value) => colorize(rich, theme.error, value);
	const heading = (value) => colorize(rich, theme.heading, value);
	const commandText = (value) => colorize(rich, theme.command, value);
	params.runtime.error(heading("Config invalid"));
	params.runtime.error(`${muted("File:")} ${muted(shortenHomePath(snapshot.path))}`);
	if (issues.length > 0) {
		params.runtime.error(muted("Problem:"));
		params.runtime.error(issues.map((issue) => `  ${error(issue)}`).join("\n"));
	}
	if (legacyIssues.length > 0) {
		params.runtime.error(muted("Legacy config keys detected:"));
		params.runtime.error(legacyIssues.map((issue) => `  ${error(issue)}`).join("\n"));
	}
	params.runtime.error("");
	params.runtime.error(`${muted("Run:")} ${commandText(formatCliCommand("openclaw doctor --fix"))}`);
	if (!allowInvalid) params.runtime.exit(1);
}
const __test__ = { resetConfigGuardStateForTests };
//#endregion
export { __test__, ensureConfigReady };
