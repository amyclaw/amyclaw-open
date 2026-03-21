import { a as telegramSetupWizard, o as telegramSetupAdapter, t as createTelegramPluginBase } from "./shared-BgGX2rQA.js";
//#region extensions/telegram/src/channel.setup.ts
const telegramSetupPlugin = { ...createTelegramPluginBase({
	setupWizard: telegramSetupWizard,
	setup: telegramSetupAdapter
}) };
//#endregion
export { telegramSetupPlugin as t };
