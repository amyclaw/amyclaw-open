import { a as imessageSetupAdapter } from "./setup-core-FmBcvIJS.js";
import { n as imessageSetupWizard, t as createIMessagePluginBase } from "./shared-DbipMvv6.js";
//#region extensions/imessage/src/channel.setup.ts
const imessageSetupPlugin = { ...createIMessagePluginBase({
	setupWizard: imessageSetupWizard,
	setup: imessageSetupAdapter
}) };
//#endregion
export { imessageSetupPlugin as t };
