import "./redact-fatrROh9.js";
import "./errors-DOJWZqNo.js";
import "./unhandled-rejections-BT0Rsc03.js";
import "./logger-ByBU4z1U.js";
import "./paths-1qR_mW4i.js";
import "./tmp-openclaw-dir-BDQ0wJ2G.js";
import "./theme-BSXzMzAA.js";
import "./globals-DqZvRoPX.js";
import "./subsystem-MGyxt_Bl.js";
import "./ansi-BPhP6LBZ.js";
import "./boolean-D8Ha5nYV.js";
import "./env-DlREndPb.js";
import "./warning-filter-Cg8_xqcp.js";
import "./utils-BMtC0Ocd.js";
import "./links-DA9sitJV.js";
import { t as detectBinary } from "./setup-binary-nB5GxsnS.js";
import { Bx as listSignalAccountIds, Hx as resolveSignalAccount, Kh as installSignalCli, Og as setSetupChannelEnabled } from "./auth-profiles-Bc6TPi0n.js";
import "./model-selection-DJOYg7Dx.js";
import "./agent-scope-B-OyGztR.js";
import "./boundary-file-read-Y1cMjPlu.js";
import "./logger-iZtdpoh6.js";
import "./exec-CwhzW0JB.js";
import "./workspace-Dns6NMt3.js";
import "./io-CezuVcrG.js";
import "./host-env-security-DnH8wzZ4.js";
import "./safe-text-BcUvBreN.js";
import "./version-BMIQmWNJ.js";
import "./env-substitution--sbeMYae.js";
import "./config-state-sYURQqD8.js";
import "./network-mode-nTYy2WxO.js";
import "./registry-jBzBWMf6.js";
import "./manifest-registry-BcOvH3_O.js";
import "./ip-w605xvSx.js";
import "./zod-schema.core-CWxzqcUs.js";
import "./config-CcaRAPg3.js";
import "./audit-fs-Cequ8jTw.js";
import "./resolve-D7R3Obgc.js";
import "./provider-web-search-DqPBRERs.js";
import "./text-runtime-Cv7IlZFR.js";
import "./workspace-dirs-B6rDmzuU.js";
import "./config-SJMQwqYd.js";
import "./tailnet-KyAU6tj_.js";
import "./net-B_Iq_SVP.js";
import "./credentials-B7GJXbww.js";
import "./routes-AlbnCYWi.js";
import "./frontmatter-BGJSb9Mh.js";
import "./env-overrides-SSye1Eey.js";
import "./path-alias-guards-B3ZKrId1.js";
import "./skills-D8mkwPU_.js";
import "./ports-D_2Jwnkx.js";
import "./ports-lsof-DiY6GaAf.js";
import "./ssh-tunnel-DFSJj-3E.js";
import "./image-ops-DM56IRtp.js";
import "./fs-safe-Ds1qsPxW.js";
import "./mime-_IkgFMS2.js";
import "./server-middleware-CsOOV2sU.js";
import "./message-channel-C4icaB2h.js";
import "./resolve-route-CUHslQlg.js";
import "./internal-hooks-CWvLyTiW.js";
import "./lazy-runtime-07jXxTa3.js";
import "./config-schema-GQ6uWjXe.js";
import "./method-scopes-BAswg77K.js";
import "./session-cost-usage-C3_3zEKV.js";
import "./paths-BumENdHQ.js";
import "./routing-3o2D0ix4.js";
import "./send-TDX_qI_x.js";
import "./node-resolve-DiVPimcG.js";
import "./provider-stream-DiwQl_xA.js";
import "./identity-file-B5i4_r6U.js";
import "./provider-models-Cym0TctV.js";
import "./secret-file-DRp-Ebe1.js";
import "./logging-BdFqMomc.js";
import "./runtime-env-CT-voxYE.js";
import "./registry-CeB-k--4.js";
import "./provider-onboard-dAr3NUh2.js";
import "./model-definitions-DwehIMlw.js";
import "./diagnostic-D8TBqX9f.js";
import "./message-hook-mappers-MHm61O7_.js";
import "./json-store-Ct34wStR.js";
import "./call-x5WvUEsz.js";
import "./multimodal-BWF8MRkz.js";
import "./memory-search-CHMV_-Bg.js";
import "./query-expansion-CHmqSE4l.js";
import "./search-manager-ByZ9OOyz.js";
import "./core-TgQ7U3Ou.js";
import "./issue-format-i6sEuV4a.js";
import "./logging-imcVaYUC.js";
import "./note-aKR6kEr4.js";
import "./state-paths-C7dX__ql.js";
import "./config-value-Cb6kcdav.js";
import "./command-secret-targets-Ow94fQb1.js";
import "./brave-wyq_csg5.js";
import "./provider-usage-La8jvEfN.js";
import "./perplexity-Cjiwa0zB.js";
import "./restart-stale-pids-OWmDUCi0.js";
import "./delivery-queue-BaPLohg3.js";
import "./pairing-token-sCwb75an.js";
import "./accounts-CXqzdDJl.js";
import "./process-runtime-CicRKAFe.js";
import "./audit-DTw2xid0.js";
import "./cli-runtime-DtIDS2w7.js";
import "./cli-utils-FHeUZLsT.js";
import "./help-format-1yV2Xzq7.js";
import "./progress-B4roBB_B.js";
import "./gateway-runtime-50-32dyb.js";
import { a as signalNumberTextInput, i as signalDmPolicy, r as signalCompletionNote, t as createSignalCliPathTextInput } from "./setup-core-D95RE7dL.js";
//#region extensions/signal/src/setup-surface.ts
const channel = "signal";
//#endregion
//#region extensions/signal/src/channel.runtime.ts
const signalSetupWizard = {
	channel,
	status: {
		configuredLabel: "configured",
		unconfiguredLabel: "needs setup",
		configuredHint: "signal-cli found",
		unconfiguredHint: "signal-cli missing",
		configuredScore: 1,
		unconfiguredScore: 0,
		resolveConfigured: ({ cfg }) => listSignalAccountIds(cfg).some((accountId) => resolveSignalAccount({
			cfg,
			accountId
		}).configured),
		resolveStatusLines: async ({ cfg, configured }) => {
			const signalCliPath = cfg.channels?.signal?.cliPath ?? "signal-cli";
			const signalCliDetected = await detectBinary(signalCliPath);
			return [`Signal: ${configured ? "configured" : "needs setup"}`, `signal-cli: ${signalCliDetected ? "found" : "missing"} (${signalCliPath})`];
		},
		resolveSelectionHint: async ({ cfg }) => {
			return await detectBinary(cfg.channels?.signal?.cliPath ?? "signal-cli") ? "signal-cli found" : "signal-cli missing";
		},
		resolveQuickstartScore: async ({ cfg }) => {
			return await detectBinary(cfg.channels?.signal?.cliPath ?? "signal-cli") ? 1 : 0;
		}
	},
	prepare: async ({ cfg, accountId, credentialValues, runtime, prompter, options }) => {
		if (!options?.allowSignalInstall) return;
		const cliDetected = await detectBinary((typeof credentialValues.cliPath === "string" ? credentialValues.cliPath : void 0) ?? resolveSignalAccount({
			cfg,
			accountId
		}).config.cliPath ?? "signal-cli");
		if (!await prompter.confirm({
			message: cliDetected ? "signal-cli detected. Reinstall/update now?" : "signal-cli not found. Install now?",
			initialValue: !cliDetected
		})) return;
		try {
			const result = await installSignalCli(runtime);
			if (result.ok && result.cliPath) {
				await prompter.note(`Installed signal-cli at ${result.cliPath}`, "Signal");
				return { credentialValues: { cliPath: result.cliPath } };
			}
			if (!result.ok) await prompter.note(result.error ?? "signal-cli install failed.", "Signal");
		} catch (error) {
			await prompter.note(`signal-cli install failed: ${String(error)}`, "Signal");
		}
	},
	credentials: [],
	textInputs: [createSignalCliPathTextInput(async ({ currentValue }) => {
		return !await detectBinary(currentValue ?? "signal-cli");
	}), signalNumberTextInput],
	completionNote: signalCompletionNote,
	dmPolicy: signalDmPolicy,
	disable: (cfg) => setSetupChannelEnabled(cfg, channel, false)
};
//#endregion
export { signalSetupWizard };
