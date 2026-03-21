import { a as setTopLevelCredentialValue, r as getTopLevelCredentialValue, t as createPluginBackedWebSearchProvider } from "./provider-web-search-DqPBRERs.js";
import { n as definePluginEntry } from "./core-TgQ7U3Ou.js";
//#region extensions/brave/index.ts
var brave_default = definePluginEntry({
	id: "brave",
	name: "Brave Plugin",
	description: "Bundled Brave plugin",
	register(api) {
		api.registerWebSearchProvider(createPluginBackedWebSearchProvider({
			id: "brave",
			label: "Brave Search",
			hint: "Structured results · country/language/time filters",
			envVars: ["BRAVE_API_KEY"],
			placeholder: "BSA...",
			signupUrl: "https://brave.com/search/api/",
			docsUrl: "https://docs.openclaw.ai/brave-search",
			autoDetectOrder: 10,
			getCredentialValue: getTopLevelCredentialValue,
			setCredentialValue: setTopLevelCredentialValue
		}));
	}
});
//#endregion
export { brave_default as t };
