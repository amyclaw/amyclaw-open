import "../../redact-fatrROh9.js";
import "../../errors-DOJWZqNo.js";
import "../../unhandled-rejections-BT0Rsc03.js";
import "../../logger-ByBU4z1U.js";
import "../../paths-1qR_mW4i.js";
import "../../tmp-openclaw-dir-BDQ0wJ2G.js";
import "../../theme-BSXzMzAA.js";
import "../../globals-DqZvRoPX.js";
import "../../subsystem-MGyxt_Bl.js";
import "../../ansi-BPhP6LBZ.js";
import "../../boolean-D8Ha5nYV.js";
import "../../env-DlREndPb.js";
import "../../warning-filter-Cg8_xqcp.js";
import "../../utils-BMtC0Ocd.js";
import "../../links-DA9sitJV.js";
import "../../setup-binary-nB5GxsnS.js";
import { Tv as createReceiptCard } from "../../auth-profiles-Bc6TPi0n.js";
import "../../model-selection-DJOYg7Dx.js";
import "../../agent-scope-B-OyGztR.js";
import "../../boundary-file-read-Y1cMjPlu.js";
import "../../logger-iZtdpoh6.js";
import "../../exec-CwhzW0JB.js";
import "../../workspace-Dns6NMt3.js";
import "../../io-CezuVcrG.js";
import "../../host-env-security-DnH8wzZ4.js";
import "../../safe-text-BcUvBreN.js";
import "../../version-BMIQmWNJ.js";
import "../../env-substitution--sbeMYae.js";
import "../../config-state-sYURQqD8.js";
import "../../network-mode-nTYy2WxO.js";
import "../../registry-jBzBWMf6.js";
import "../../manifest-registry-BcOvH3_O.js";
import "../../ip-w605xvSx.js";
import "../../zod-schema.core-CWxzqcUs.js";
import "../../config-CcaRAPg3.js";
import "../../audit-fs-Cequ8jTw.js";
import "../../resolve-D7R3Obgc.js";
import "../../provider-web-search-DqPBRERs.js";
import "../../text-runtime-Cv7IlZFR.js";
import "../../workspace-dirs-B6rDmzuU.js";
import "../../config-SJMQwqYd.js";
import "../../tailnet-KyAU6tj_.js";
import "../../net-B_Iq_SVP.js";
import "../../credentials-B7GJXbww.js";
import "../../routes-AlbnCYWi.js";
import "../../frontmatter-BGJSb9Mh.js";
import "../../env-overrides-SSye1Eey.js";
import "../../path-alias-guards-B3ZKrId1.js";
import "../../skills-D8mkwPU_.js";
import "../../ports-D_2Jwnkx.js";
import "../../ports-lsof-DiY6GaAf.js";
import "../../ssh-tunnel-DFSJj-3E.js";
import "../../image-ops-DM56IRtp.js";
import "../../fs-safe-Ds1qsPxW.js";
import "../../mime-_IkgFMS2.js";
import "../../server-middleware-CsOOV2sU.js";
import "../../message-channel-C4icaB2h.js";
import "../../resolve-route-CUHslQlg.js";
import "../../internal-hooks-CWvLyTiW.js";
import "../../lazy-runtime-07jXxTa3.js";
import "../../config-schema-GQ6uWjXe.js";
import "../../method-scopes-BAswg77K.js";
import "../../session-cost-usage-C3_3zEKV.js";
import "../../paths-BumENdHQ.js";
import "../../routing-3o2D0ix4.js";
import "../../send-TDX_qI_x.js";
import "../../node-resolve-DiVPimcG.js";
import "../../provider-stream-DiwQl_xA.js";
import "../../identity-file-B5i4_r6U.js";
import "../../provider-models-Cym0TctV.js";
import "../../secret-file-DRp-Ebe1.js";
import "../../logging-BdFqMomc.js";
import "../../runtime-env-CT-voxYE.js";
import "../../registry-CeB-k--4.js";
import "../../provider-onboard-dAr3NUh2.js";
import "../../model-definitions-DwehIMlw.js";
import "../../diagnostic-D8TBqX9f.js";
import "../../message-hook-mappers-MHm61O7_.js";
import { a as createImageCard, i as createActionCard, o as createInfoCard, s as createListCard } from "../../line-DF1xtW_N.js";
import "../../json-store-Ct34wStR.js";
import "../../call-x5WvUEsz.js";
import "../../multimodal-BWF8MRkz.js";
import "../../memory-search-CHMV_-Bg.js";
import "../../query-expansion-CHmqSE4l.js";
import "../../search-manager-ByZ9OOyz.js";
import { t as defineChannelPluginEntry } from "../../core-TgQ7U3Ou.js";
import "../../issue-format-i6sEuV4a.js";
import "../../logging-imcVaYUC.js";
import "../../note-aKR6kEr4.js";
import "../../state-paths-C7dX__ql.js";
import "../../config-value-Cb6kcdav.js";
import "../../command-secret-targets-Ow94fQb1.js";
import "../../brave-wyq_csg5.js";
import "../../provider-usage-La8jvEfN.js";
import "../../perplexity-Cjiwa0zB.js";
import "../../restart-stale-pids-OWmDUCi0.js";
import "../../delivery-queue-BaPLohg3.js";
import "../../pairing-token-sCwb75an.js";
import "../../accounts-CXqzdDJl.js";
import "../../process-runtime-CicRKAFe.js";
import "../../audit-DTw2xid0.js";
import "../../cli-runtime-DtIDS2w7.js";
import "../../cli-utils-FHeUZLsT.js";
import "../../help-format-1yV2Xzq7.js";
import "../../progress-B4roBB_B.js";
import "../../gateway-runtime-50-32dyb.js";
import "../../channel-policy-c4_vurDT.js";
import { n as setLineRuntime, t as linePlugin } from "../../channel--Nk8jl6Q.js";
//#region extensions/line/src/card-command.ts
const CARD_USAGE = `Usage: /card <type> "title" "body" [options]

Types:
  info "Title" "Body" ["Footer"]
  image "Title" "Caption" --url <image-url>
  action "Title" "Body" --actions "Btn1|url1,Btn2|text2"
  list "Title" "Item1|Desc1,Item2|Desc2"
  receipt "Title" "Item1:$10,Item2:$20" --total "$30"
  confirm "Question?" --yes "Yes|data" --no "No|data"
  buttons "Title" "Text" --actions "Btn1|url1,Btn2|data2"

Examples:
  /card info "Welcome" "Thanks for joining!"
  /card image "Product" "Check it out" --url https://example.com/img.jpg
  /card action "Menu" "Choose an option" --actions "Order|/order,Help|/help"`;
function buildLineReply(lineData) {
	return { channelData: { line: lineData } };
}
/**
* Parse action string format: "Label|data,Label2|data2"
* Data can be a URL (uri action) or plain text (message action) or key=value (postback)
*/
function parseActions(actionsStr) {
	if (!actionsStr) return [];
	const results = [];
	for (const part of actionsStr.split(",")) {
		const [label, data] = part.trim().split("|").map((s) => s.trim());
		if (!label) continue;
		const actionData = data || label;
		if (actionData.startsWith("http://") || actionData.startsWith("https://")) results.push({
			label,
			action: {
				type: "uri",
				label: label.slice(0, 20),
				uri: actionData
			}
		});
		else if (actionData.includes("=")) results.push({
			label,
			action: {
				type: "postback",
				label: label.slice(0, 20),
				data: actionData.slice(0, 300),
				displayText: label
			}
		});
		else results.push({
			label,
			action: {
				type: "message",
				label: label.slice(0, 20),
				text: actionData
			}
		});
	}
	return results;
}
/**
* Parse list items format: "Item1|Subtitle1,Item2|Subtitle2"
*/
function parseListItems(itemsStr) {
	return itemsStr.split(",").map((part) => {
		const [title, subtitle] = part.trim().split("|").map((s) => s.trim());
		return {
			title: title || "",
			subtitle
		};
	}).filter((item) => item.title);
}
/**
* Parse receipt items format: "Item1:$10,Item2:$20"
*/
function parseReceiptItems(itemsStr) {
	return itemsStr.split(",").map((part) => {
		const colonIndex = part.lastIndexOf(":");
		if (colonIndex === -1) return {
			name: part.trim(),
			value: ""
		};
		return {
			name: part.slice(0, colonIndex).trim(),
			value: part.slice(colonIndex + 1).trim()
		};
	}).filter((item) => item.name);
}
/**
* Parse quoted arguments from command string
* Supports: /card type "arg1" "arg2" "arg3" --flag value
*/
function parseCardArgs(argsStr) {
	const result = {
		type: "",
		args: [],
		flags: {}
	};
	const typeMatch = argsStr.match(/^(\w+)/);
	if (typeMatch) {
		result.type = typeMatch[1].toLowerCase();
		argsStr = argsStr.slice(typeMatch[0].length).trim();
	}
	const quotedRegex = /"([^"]*?)"/g;
	let match;
	while ((match = quotedRegex.exec(argsStr)) !== null) result.args.push(match[1]);
	const flagRegex = /--(\w+)\s+(?:"([^"]*?)"|(\S+))/g;
	while ((match = flagRegex.exec(argsStr)) !== null) result.flags[match[1]] = match[2] ?? match[3];
	return result;
}
function registerLineCardCommand(api) {
	api.registerCommand({
		name: "card",
		description: "Send a rich card message (LINE).",
		acceptsArgs: true,
		requireAuth: false,
		handler: async (ctx) => {
			const argsStr = ctx.args?.trim() ?? "";
			if (!argsStr) return { text: CARD_USAGE };
			const { type, args, flags } = parseCardArgs(argsStr);
			if (!type) return { text: CARD_USAGE };
			if (ctx.channel !== "line") return { text: `[${type} card] ${args.join(" - ")}`.trim() };
			try {
				switch (type) {
					case "info": {
						const [title = "Info", body = "", footer] = args;
						const bubble = createInfoCard(title, body, footer);
						return buildLineReply({ flexMessage: {
							altText: `${title}: ${body}`.slice(0, 400),
							contents: bubble
						} });
					}
					case "image": {
						const [title = "Image", caption = ""] = args;
						const imageUrl = flags.url || flags.image;
						if (!imageUrl) return { text: "Error: Image card requires --url <image-url>" };
						const bubble = createImageCard(imageUrl, title, caption);
						return buildLineReply({ flexMessage: {
							altText: `${title}: ${caption}`.slice(0, 400),
							contents: bubble
						} });
					}
					case "action": {
						const [title = "Actions", body = ""] = args;
						const actions = parseActions(flags.actions);
						if (actions.length === 0) return { text: "Error: Action card requires --actions \"Label1|data1,Label2|data2\"" };
						const bubble = createActionCard(title, body, actions, { imageUrl: flags.url || flags.image });
						return buildLineReply({ flexMessage: {
							altText: `${title}: ${body}`.slice(0, 400),
							contents: bubble
						} });
					}
					case "list": {
						const [title = "List", itemsStr = ""] = args;
						const items = parseListItems(itemsStr || flags.items || "");
						if (items.length === 0) return { text: "Error: List card requires items. Usage: /card list \"Title\" \"Item1|Desc1,Item2|Desc2\"" };
						const bubble = createListCard(title, items);
						return buildLineReply({ flexMessage: {
							altText: `${title}: ${items.map((i) => i.title).join(", ")}`.slice(0, 400),
							contents: bubble
						} });
					}
					case "receipt": {
						const [title = "Receipt", itemsStr = ""] = args;
						const items = parseReceiptItems(itemsStr || flags.items || "");
						const total = flags.total ? {
							label: "Total",
							value: flags.total
						} : void 0;
						const footer = flags.footer;
						if (items.length === 0) return { text: "Error: Receipt card requires items. Usage: /card receipt \"Title\" \"Item1:$10,Item2:$20\" --total \"$30\"" };
						const bubble = createReceiptCard({
							title,
							items,
							total,
							footer
						});
						return buildLineReply({ flexMessage: {
							altText: `${title}: ${items.map((i) => `${i.name} ${i.value}`).join(", ")}`.slice(0, 400),
							contents: bubble
						} });
					}
					case "confirm": {
						const [question = "Confirm?"] = args;
						const yesStr = flags.yes || "Yes|yes";
						const noStr = flags.no || "No|no";
						const [yesLabel, yesData] = yesStr.split("|").map((s) => s.trim());
						const [noLabel, noData] = noStr.split("|").map((s) => s.trim());
						return buildLineReply({ templateMessage: {
							type: "confirm",
							text: question,
							confirmLabel: yesLabel || "Yes",
							confirmData: yesData || "yes",
							cancelLabel: noLabel || "No",
							cancelData: noData || "no",
							altText: question
						} });
					}
					case "buttons": {
						const [title = "Menu", text = "Choose an option"] = args;
						const actionParts = parseActions(flags.actions || "");
						if (actionParts.length === 0) return { text: "Error: Buttons card requires --actions \"Label1|data1,Label2|data2\"" };
						const templateActions = actionParts.map((a) => {
							const action = a.action;
							const label = action.label ?? a.label;
							if (action.type === "uri") return {
								type: "uri",
								label,
								uri: action.uri
							};
							if (action.type === "postback") return {
								type: "postback",
								label,
								data: action.data
							};
							return {
								type: "message",
								label,
								data: action.text
							};
						});
						return buildLineReply({ templateMessage: {
							type: "buttons",
							title,
							text,
							thumbnailImageUrl: flags.url || flags.image,
							actions: templateActions
						} });
					}
					default: return { text: `Unknown card type: "${type}". Available types: info, image, action, list, receipt, confirm, buttons` };
				}
			} catch (err) {
				return { text: `Error creating card: ${String(err)}` };
			}
		}
	});
}
//#endregion
//#region extensions/line/index.ts
var line_default = defineChannelPluginEntry({
	id: "line",
	name: "LINE",
	description: "LINE Messaging API channel plugin",
	plugin: linePlugin,
	setRuntime: setLineRuntime,
	registerFull: registerLineCardCommand
});
//#endregion
export { line_default as default };
