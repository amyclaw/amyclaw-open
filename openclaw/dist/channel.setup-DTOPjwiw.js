import { o as signalSetupAdapter } from "./setup-core-D95RE7dL.js";
import { r as signalSetupWizard, t as createSignalPluginBase } from "./shared-YWhhYuST.js";
//#region extensions/signal/src/channel.setup.ts
const signalSetupPlugin = { ...createSignalPluginBase({
	setupWizard: signalSetupWizard,
	setup: signalSetupAdapter
}) };
//#endregion
export { signalSetupPlugin as t };
