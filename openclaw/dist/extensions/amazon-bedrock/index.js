import "../../logger-ByBU4z1U.js";
import "../../paths-1qR_mW4i.js";
import "../../tmp-openclaw-dir-BDQ0wJ2G.js";
import "../../theme-BSXzMzAA.js";
import "../../globals-DqZvRoPX.js";
import "../../subsystem-MGyxt_Bl.js";
import "../../ansi-BPhP6LBZ.js";
import "../../utils-BMtC0Ocd.js";
import "../../agent-scope-B-OyGztR.js";
import "../../boundary-file-read-Y1cMjPlu.js";
import "../../logger-iZtdpoh6.js";
import "../../exec-CwhzW0JB.js";
import "../../workspace-Dns6NMt3.js";
import "../../registry-jBzBWMf6.js";
import "../../resolve-route-CUHslQlg.js";
import "../../secret-file-DRp-Ebe1.js";
import { n as definePluginEntry } from "../../core-TgQ7U3Ou.js";
//#region extensions/amazon-bedrock/index.ts
const PROVIDER_ID = "amazon-bedrock";
const CLAUDE_46_MODEL_RE = /claude-(?:opus|sonnet)-4(?:\.|-)6(?:$|[-.])/i;
var amazon_bedrock_default = definePluginEntry({
	id: PROVIDER_ID,
	name: "Amazon Bedrock Provider",
	description: "Bundled Amazon Bedrock provider policy plugin",
	register(api) {
		api.registerProvider({
			id: PROVIDER_ID,
			label: "Amazon Bedrock",
			docsPath: "/providers/models",
			auth: [],
			resolveDefaultThinkingLevel: ({ modelId }) => CLAUDE_46_MODEL_RE.test(modelId.trim()) ? "adaptive" : void 0
		});
	}
});
//#endregion
export { amazon_bedrock_default as default };
