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
import "./setup-binary-nB5GxsnS.js";
import { ww as PAIRING_APPROVED_MESSAGE } from "./auth-profiles-Bc6TPi0n.js";
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
import { l as normalizeSecretInputString } from "./types.secrets-DuSPmmWB.js";
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
import { t as createAccountStatusSink } from "./channel-lifecycle-x1smD1P7.js";
import "./webhook-targets-CXPKfaOD.js";
import "./zalo-sRe5QYZT.js";
import "./text-chunking-DjnX5OPU.js";
import { i as getMe, n as ZaloApiError, t as resolveZaloProxyFetch } from "./proxy-Ci_bJhQF.js";
import { t as sendMessageZalo } from "./send-BTeWBTrU.js";
//#region extensions/zalo/src/probe.ts
async function probeZalo(token, timeoutMs = 5e3, fetcher) {
	if (!token?.trim()) return {
		ok: false,
		error: "No token provided",
		elapsedMs: 0
	};
	const startTime = Date.now();
	try {
		const response = await getMe(token.trim(), timeoutMs, fetcher);
		const elapsedMs = Date.now() - startTime;
		if (response.ok && response.result) return {
			ok: true,
			bot: response.result,
			elapsedMs
		};
		return {
			ok: false,
			error: "Invalid response from Zalo API",
			elapsedMs
		};
	} catch (err) {
		const elapsedMs = Date.now() - startTime;
		if (err instanceof ZaloApiError) return {
			ok: false,
			error: err.description ?? err.message,
			elapsedMs
		};
		if (err instanceof Error) {
			if (err.name === "AbortError") return {
				ok: false,
				error: `Request timed out after ${timeoutMs}ms`,
				elapsedMs
			};
			return {
				ok: false,
				error: err.message,
				elapsedMs
			};
		}
		return {
			ok: false,
			error: String(err),
			elapsedMs
		};
	}
}
//#endregion
//#region extensions/zalo/src/channel.runtime.ts
async function notifyZaloPairingApproval(params) {
	const { resolveZaloAccount } = await import("./accounts-CC4rhbJ3.js");
	const account = resolveZaloAccount({ cfg: params.cfg });
	if (!account.token) throw new Error("Zalo token not configured");
	await sendMessageZalo(params.id, PAIRING_APPROVED_MESSAGE, { token: account.token });
}
async function sendZaloText(params) {
	return await sendMessageZalo(params.to, params.text, params);
}
async function probeZaloAccount(params) {
	return await probeZalo(params.account.token, params.timeoutMs, resolveZaloProxyFetch(params.account.config.proxy));
}
async function startZaloGatewayAccount(ctx) {
	const account = ctx.account;
	const token = account.token.trim();
	const mode = account.config.webhookUrl ? "webhook" : "polling";
	let zaloBotLabel = "";
	const fetcher = resolveZaloProxyFetch(account.config.proxy);
	try {
		const probe = await probeZalo(token, 2500, fetcher);
		const name = probe.ok ? probe.bot?.name?.trim() : null;
		if (name) zaloBotLabel = ` (${name})`;
		if (!probe.ok) ctx.log?.warn?.(`[${account.accountId}] Zalo probe failed before provider start (${String(probe.elapsedMs)}ms): ${probe.error}`);
		ctx.setStatus({
			accountId: account.accountId,
			bot: probe.bot
		});
	} catch (err) {
		ctx.log?.warn?.(`[${account.accountId}] Zalo probe threw before provider start: ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
	}
	const statusSink = createAccountStatusSink({
		accountId: ctx.accountId,
		setStatus: ctx.setStatus
	});
	ctx.log?.info(`[${account.accountId}] starting provider${zaloBotLabel} mode=${mode}`);
	const { monitorZaloProvider } = await import("./monitor-B-xrO_2c.js");
	return monitorZaloProvider({
		token,
		account,
		config: ctx.cfg,
		runtime: ctx.runtime,
		abortSignal: ctx.abortSignal,
		useWebhook: Boolean(account.config.webhookUrl),
		webhookUrl: account.config.webhookUrl,
		webhookSecret: normalizeSecretInputString(account.config.webhookSecret),
		webhookPath: account.config.webhookPath,
		fetcher,
		statusSink
	});
}
//#endregion
export { notifyZaloPairingApproval, probeZaloAccount, sendZaloText, startZaloGatewayAccount };
