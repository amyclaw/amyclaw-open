//#region extensions/zai/model-definitions.ts
const ZAI_CODING_GLOBAL_BASE_URL = "https://api.z.ai/api/coding/paas/v4";
const ZAI_CODING_CN_BASE_URL = "https://open.bigmodel.cn/api/coding/paas/v4";
const ZAI_GLOBAL_BASE_URL = "https://api.z.ai/api/paas/v4";
const ZAI_CN_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";
const ZAI_DEFAULT_MODEL_ID = "glm-5";
const ZAI_DEFAULT_MODEL_REF = `zai/${ZAI_DEFAULT_MODEL_ID}`;
const ZAI_DEFAULT_COST = {
	input: 0,
	output: 0,
	cacheRead: 0,
	cacheWrite: 0
};
const ZAI_MODEL_CATALOG = {
	"glm-5": {
		name: "GLM-5",
		reasoning: true
	},
	"glm-5-turbo": {
		name: "GLM-5 Turbo",
		reasoning: true
	},
	"glm-4.7": {
		name: "GLM-4.7",
		reasoning: true
	},
	"glm-4.7-flash": {
		name: "GLM-4.7 Flash",
		reasoning: true
	},
	"glm-4.7-flashx": {
		name: "GLM-4.7 FlashX",
		reasoning: true
	}
};
function resolveZaiBaseUrl(endpoint) {
	switch (endpoint) {
		case "coding-cn": return ZAI_CODING_CN_BASE_URL;
		case "global": return ZAI_GLOBAL_BASE_URL;
		case "cn": return ZAI_CN_BASE_URL;
		case "coding-global": return ZAI_CODING_GLOBAL_BASE_URL;
		default: return ZAI_GLOBAL_BASE_URL;
	}
}
function buildZaiModelDefinition(params) {
	const catalog = ZAI_MODEL_CATALOG[params.id];
	return {
		id: params.id,
		name: params.name ?? catalog?.name ?? `GLM ${params.id}`,
		reasoning: params.reasoning ?? catalog?.reasoning ?? true,
		input: ["text"],
		cost: params.cost ?? ZAI_DEFAULT_COST,
		contextWindow: params.contextWindow ?? 204800,
		maxTokens: params.maxTokens ?? 131072
	};
}
//#endregion
export { ZAI_DEFAULT_MODEL_REF as a, resolveZaiBaseUrl as c, ZAI_DEFAULT_MODEL_ID as i, ZAI_CODING_CN_BASE_URL as n, ZAI_GLOBAL_BASE_URL as o, ZAI_CODING_GLOBAL_BASE_URL as r, buildZaiModelDefinition as s, ZAI_CN_BASE_URL as t };
