import { i as setScopedCredentialValue, n as getScopedCredentialValue, t as createPluginBackedWebSearchProvider } from "./provider-web-search-DqPBRERs.js";
import { n as definePluginEntry } from "./core-TgQ7U3Ou.js";
//#region extensions/perplexity/index.ts
var perplexity_default = definePluginEntry({
	id: "perplexity",
	name: "Perplexity Plugin",
	description: "Bundled Perplexity plugin",
	register(api) {
		api.registerWebSearchProvider(createPluginBackedWebSearchProvider({
			id: "perplexity",
			label: "Perplexity Search",
			hint: "Structured results · domain/country/language/time filters",
			envVars: ["PERPLEXITY_API_KEY", "OPENROUTER_API_KEY"],
			placeholder: "pplx-...",
			signupUrl: "https://www.perplexity.ai/settings/api",
			docsUrl: "https://docs.openclaw.ai/perplexity",
			autoDetectOrder: 50,
			getCredentialValue: (searchConfig) => getScopedCredentialValue(searchConfig, "perplexity"),
			setCredentialValue: (searchConfigTarget, value) => setScopedCredentialValue(searchConfigTarget, "perplexity", value)
		}));
	}
});
//#endregion
export { perplexity_default as t };
