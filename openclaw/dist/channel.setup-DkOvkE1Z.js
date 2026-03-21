import { r as discordSetupAdapter } from "./setup-core-DwZ_G2We.js";
import { t as createDiscordPluginBase } from "./shared-C1K1TlLJ.js";
//#region extensions/discord/src/channel.setup.ts
const discordSetupPlugin = { ...createDiscordPluginBase({ setup: discordSetupAdapter }) };
//#endregion
export { discordSetupPlugin as t };
