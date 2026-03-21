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
import "../../auth-profiles-Bc6TPi0n.js";
import "../../model-selection-DJOYg7Dx.js";
import "../../agent-scope-B-OyGztR.js";
import "../../boundary-file-read-Y1cMjPlu.js";
import "../../logger-iZtdpoh6.js";
import "../../exec-CwhzW0JB.js";
import "../../workspace-Dns6NMt3.js";
import { _n as resolveActiveTalkProviderConfig } from "../../io-CezuVcrG.js";
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
import "../../json-store-Ct34wStR.js";
import "../../call-x5WvUEsz.js";
import "../../multimodal-BWF8MRkz.js";
import "../../memory-search-CHMV_-Bg.js";
import "../../query-expansion-CHmqSE4l.js";
import "../../search-manager-ByZ9OOyz.js";
import { n as definePluginEntry } from "../../core-TgQ7U3Ou.js";
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
import "../../talk-voice-C0h4atrk.js";
//#region extensions/talk-voice/index.ts
function mask(s, keep = 6) {
	const trimmed = s.trim();
	if (trimmed.length <= keep) return "***";
	return `${trimmed.slice(0, keep)}…`;
}
function isLikelyVoiceId(value) {
	const v = value.trim();
	if (v.length < 10 || v.length > 64) return false;
	return /^[a-zA-Z0-9_-]+$/.test(v);
}
function resolveProviderLabel(providerId) {
	switch (providerId) {
		case "openai": return "OpenAI";
		case "microsoft": return "Microsoft";
		case "elevenlabs": return "ElevenLabs";
		default: return providerId;
	}
}
function formatVoiceMeta(voice) {
	const parts = [voice.locale, voice.gender];
	const personalities = voice.personalities?.filter((value) => value.trim().length > 0) ?? [];
	if (personalities.length > 0) parts.push(personalities.join(", "));
	const filtered = parts.filter((part) => Boolean(part?.trim()));
	return filtered.length > 0 ? filtered.join(" · ") : void 0;
}
function formatVoiceList(voices, limit, providerId) {
	const sliced = voices.slice(0, Math.max(1, Math.min(limit, 50)));
	const lines = [];
	lines.push(`${resolveProviderLabel(providerId)} voices: ${voices.length}`);
	lines.push("");
	for (const v of sliced) {
		const name = (v.name ?? "").trim() || "(unnamed)";
		const category = (v.category ?? "").trim();
		const meta = category ? ` · ${category}` : "";
		lines.push(`- ${name}${meta}`);
		lines.push(`  id: ${v.id}`);
		const details = formatVoiceMeta(v);
		if (details) lines.push(`  meta: ${details}`);
		const description = (v.description ?? "").trim();
		if (description) lines.push(`  note: ${description}`);
	}
	if (voices.length > sliced.length) {
		lines.push("");
		lines.push(`(showing first ${sliced.length})`);
	}
	return lines.join("\n");
}
function findVoice(voices, query) {
	const q = query.trim();
	if (!q) return null;
	const lower = q.toLowerCase();
	const byId = voices.find((v) => v.id === q);
	if (byId) return byId;
	const exactName = voices.find((v) => (v.name ?? "").trim().toLowerCase() === lower);
	if (exactName) return exactName;
	return voices.find((v) => (v.name ?? "").trim().toLowerCase().includes(lower)) ?? null;
}
function asTrimmedString(value) {
	return typeof value === "string" ? value.trim() : "";
}
function resolveCommandLabel(channel) {
	return channel === "discord" ? "/talkvoice" : "/voice";
}
function asProviderBaseUrl(value) {
	return asTrimmedString(value) || void 0;
}
var talk_voice_default = definePluginEntry({
	id: "talk-voice",
	name: "Talk Voice",
	description: "Command helpers for managing Talk voice configuration",
	register(api) {
		api.registerCommand({
			name: "voice",
			nativeNames: { discord: "talkvoice" },
			description: "List/set Talk provider voices (affects iOS Talk playback).",
			acceptsArgs: true,
			handler: async (ctx) => {
				const commandLabel = resolveCommandLabel(ctx.channel);
				const tokens = (ctx.args?.trim() ?? "").split(/\s+/).filter(Boolean);
				const action = (tokens[0] ?? "status").toLowerCase();
				const cfg = api.runtime.config.loadConfig();
				const active = resolveActiveTalkProviderConfig(cfg.talk);
				if (!active) return { text: "Talk voice is not configured.\n\nMissing: talk.provider and talk.providers.<provider>.\nSet it on the gateway, then retry." };
				const providerId = active.provider;
				const providerLabel = resolveProviderLabel(providerId);
				const apiKey = asTrimmedString(active.config.apiKey);
				const baseUrl = asProviderBaseUrl(active.config.baseUrl);
				const currentVoiceId = asTrimmedString(active.config.voiceId) || asTrimmedString(cfg.talk?.voiceId);
				if (action === "status") return { text: `Talk voice status:
- provider: ${providerId}\n- talk.voiceId: ${currentVoiceId ? currentVoiceId : "(unset)"}\n- ${providerId}.apiKey: ${apiKey ? mask(apiKey) : "(unset)"}` };
				if (action === "list") {
					const limit = Number.parseInt(tokens[1] ?? "12", 10);
					try {
						return { text: formatVoiceList(await api.runtime.tts.listVoices({
							provider: providerId,
							cfg,
							apiKey: apiKey || void 0,
							baseUrl
						}), Number.isFinite(limit) ? limit : 12, providerId) };
					} catch (error) {
						return { text: `${providerLabel} voice list failed: ${error instanceof Error ? error.message : String(error)}` };
					}
				}
				if (action === "set") {
					const query = tokens.slice(1).join(" ").trim();
					if (!query) return { text: `Usage: ${commandLabel} set <voiceId|name>` };
					let voices;
					try {
						voices = await api.runtime.tts.listVoices({
							provider: providerId,
							cfg,
							apiKey: apiKey || void 0,
							baseUrl
						});
					} catch (error) {
						return { text: `${providerLabel} voice lookup failed: ${error instanceof Error ? error.message : String(error)}` };
					}
					const chosen = findVoice(voices, query);
					if (!chosen) return { text: `No voice found for ${isLikelyVoiceId(query) ? query : `"${query}"`}. Try: ${commandLabel} list` };
					const nextConfig = {
						...cfg,
						talk: {
							...cfg.talk,
							provider: providerId,
							providers: {
								...cfg.talk?.providers ?? {},
								[providerId]: {
									...cfg.talk?.providers?.[providerId] ?? {},
									voiceId: chosen.id
								}
							},
							...providerId === "elevenlabs" ? { voiceId: chosen.id } : {}
						}
					};
					await api.runtime.config.writeConfigFile(nextConfig);
					return { text: `✅ ${providerLabel} Talk voice set to ${(chosen.name ?? "").trim() || "(unnamed)"}\n${chosen.id}` };
				}
				return { text: [
					"Voice commands:",
					"",
					`${commandLabel} status`,
					`${commandLabel} list [limit]`,
					`${commandLabel} set <voiceId|name>`
				].join("\n") };
			}
		});
	}
});
//#endregion
export { talk_voice_default as default };
