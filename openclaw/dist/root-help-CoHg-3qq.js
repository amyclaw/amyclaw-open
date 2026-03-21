import "./logger-ByBU4z1U.js";
import "./paths-1qR_mW4i.js";
import "./tmp-openclaw-dir-BDQ0wJ2G.js";
import "./theme-BSXzMzAA.js";
import "./globals-DqZvRoPX.js";
import "./ansi-BPhP6LBZ.js";
import "./utils-BMtC0Ocd.js";
import "./links-DA9sitJV.js";
import { n as VERSION } from "./version-BMIQmWNJ.js";
import { t as getCoreCliCommandDescriptors } from "./core-command-descriptors-H2nNxqwG.js";
import { n as getSubCliEntries } from "./subcli-descriptors-DuBgXI_6.js";
import "./banner-8QYyJMHk.js";
import { t as configureProgramHelp } from "./help-D8aSxY_F.js";
import { Command } from "commander";
//#region src/cli/program/root-help.ts
function buildRootHelpProgram() {
	const program = new Command();
	configureProgramHelp(program, {
		programVersion: VERSION,
		channelOptions: [],
		messageChannelOptions: "",
		agentChannelOptions: ""
	});
	for (const command of getCoreCliCommandDescriptors()) program.command(command.name).description(command.description);
	for (const command of getSubCliEntries()) program.command(command.name).description(command.description);
	return program;
}
function outputRootHelp() {
	buildRootHelpProgram().outputHelp();
}
//#endregion
export { outputRootHelp };
