import { Oo as webAuthExists } from "./auth-profiles-Bc6TPi0n.js";
import { t as whatsappSetupAdapter } from "./setup-core-B8JHAhvf.js";
import { i as whatsappSetupWizardProxy, n as createWhatsAppPluginBase } from "./shared-8RbnbcEj.js";
//#region extensions/whatsapp/src/channel.setup.ts
const whatsappSetupPlugin = { ...createWhatsAppPluginBase({
	setupWizard: whatsappSetupWizardProxy,
	setup: whatsappSetupAdapter,
	isConfigured: async (account) => await webAuthExists(account.authDir)
}) };
//#endregion
export { whatsappSetupPlugin as t };
