import "./redact-fatrROh9.js";
import "./errors-DOJWZqNo.js";
import "./unhandled-rejections-BT0Rsc03.js";
import "./logger-ByBU4z1U.js";
import "./paths-1qR_mW4i.js";
import "./tmp-openclaw-dir-BDQ0wJ2G.js";
import "./theme-BSXzMzAA.js";
import "./globals-DqZvRoPX.js";
import { t as createSubsystemLogger } from "./subsystem-MGyxt_Bl.js";
import "./ansi-BPhP6LBZ.js";
import "./boolean-D8Ha5nYV.js";
import "./env-DlREndPb.js";
import "./warning-filter-Cg8_xqcp.js";
import "./utils-BMtC0Ocd.js";
import "./links-DA9sitJV.js";
import "./setup-binary-nB5GxsnS.js";
import { Uc as replaceSubagentRunAfterSteer, lC as updateSessionStore, rC as loadSessionStore, xC as readSessionMessages } from "./auth-profiles-Bc6TPi0n.js";
import "./model-selection-DJOYg7Dx.js";
import "./agent-scope-B-OyGztR.js";
import { u as resolveAgentIdFromSessionKey } from "./session-key-DyhRsRh-.js";
import "./boundary-file-read-Y1cMjPlu.js";
import "./logger-iZtdpoh6.js";
import "./exec-CwhzW0JB.js";
import "./workspace-Dns6NMt3.js";
import { s as loadConfig } from "./io-CezuVcrG.js";
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
import { l as resolveStorePath } from "./paths-BumENdHQ.js";
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
import { n as callGateway } from "./call-x5WvUEsz.js";
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
import crypto from "node:crypto";
//#region src/agents/subagent-orphan-recovery.ts
/**
* Post-restart orphan recovery for subagent sessions.
*
* After a SIGUSR1 gateway reload aborts in-flight subagent LLM calls,
* this module scans for orphaned sessions (those with `abortedLastRun: true`
* that are still tracked as active in the subagent registry) and sends a
* synthetic resume message to restart their work.
*
* @see https://github.com/openclaw/openclaw/issues/47711
*/
const log = createSubsystemLogger("subagent-orphan-recovery");
/** Delay before attempting recovery to let the gateway finish bootstrapping. */
const DEFAULT_RECOVERY_DELAY_MS = 5e3;
/**
* Build the resume message for an orphaned subagent.
*/
function buildResumeMessage(task, lastHumanMessage) {
	const maxTaskLen = 2e3;
	let message = `[System] Your previous turn was interrupted by a gateway reload. Your original task was:\n\n${task.length > maxTaskLen ? `${task.slice(0, maxTaskLen)}...` : task}\n\n`;
	if (lastHumanMessage) message += `The last message from the user before the interruption was:\n\n${lastHumanMessage}\n\n`;
	message += `Please continue where you left off.`;
	return message;
}
function extractMessageText(msg) {
	if (!msg || typeof msg !== "object") return;
	const m = msg;
	if (typeof m.content === "string") return m.content;
	if (Array.isArray(m.content)) return m.content.filter((c) => typeof c === "object" && c !== null && c.type === "text" && typeof c.text === "string").map((c) => c.text).filter(Boolean).join("\n") || void 0;
}
/**
* Send a resume message to an orphaned subagent session via the gateway agent method.
*/
async function resumeOrphanedSession(params) {
	let resumeMessage = buildResumeMessage(params.task, params.lastHumanMessage);
	if (params.configChangeHint) resumeMessage += params.configChangeHint;
	try {
		const result = await callGateway({
			method: "agent",
			params: {
				message: resumeMessage,
				sessionKey: params.sessionKey,
				idempotencyKey: crypto.randomUUID(),
				deliver: false,
				lane: "subagent"
			},
			timeoutMs: 1e4
		});
		if (!replaceSubagentRunAfterSteer({
			previousRunId: params.originalRunId,
			nextRunId: result.runId,
			fallback: params.originalRun
		})) {
			log.warn(`resumed orphaned session ${params.sessionKey} but remap failed (old run already removed); treating as failure`);
			return false;
		}
		log.info(`resumed orphaned session: ${params.sessionKey}`);
		return true;
	} catch (err) {
		log.warn(`failed to resume orphaned session ${params.sessionKey}: ${String(err)}`);
		return false;
	}
}
/**
* Scan for and resume orphaned subagent sessions after a gateway restart.
*
* An orphaned session is one where:
* 1. It has an active (not ended) entry in the subagent run registry
* 2. Its session store entry has `abortedLastRun: true`
*
* For each orphaned session found, we:
* 1. Clear the `abortedLastRun` flag
* 2. Send a synthetic resume message to trigger a new LLM turn
*/
async function recoverOrphanedSubagentSessions(params) {
	const result = {
		recovered: 0,
		failed: 0,
		skipped: 0
	};
	const resumedSessionKeys = params.resumedSessionKeys ?? /* @__PURE__ */ new Set();
	const configChangePattern = /openclaw\.json|openclaw gateway restart|config\.patch/i;
	try {
		const activeRuns = params.getActiveRuns();
		if (activeRuns.size === 0) return result;
		const cfg = loadConfig();
		const storeCache = /* @__PURE__ */ new Map();
		for (const [runId, runRecord] of activeRuns.entries()) {
			if (typeof runRecord.endedAt === "number" && runRecord.endedAt > 0) continue;
			const childSessionKey = runRecord.childSessionKey?.trim();
			if (!childSessionKey) continue;
			if (resumedSessionKeys.has(childSessionKey)) {
				result.skipped++;
				continue;
			}
			try {
				const agentId = resolveAgentIdFromSessionKey(childSessionKey);
				const storePath = resolveStorePath(cfg.session?.store, { agentId });
				let store = storeCache.get(storePath);
				if (!store) {
					store = loadSessionStore(storePath);
					storeCache.set(storePath, store);
				}
				const entry = store[childSessionKey];
				if (!entry) {
					result.skipped++;
					continue;
				}
				if (!entry.abortedLastRun) {
					result.skipped++;
					continue;
				}
				log.info(`found orphaned subagent session: ${childSessionKey} (run=${runId})`);
				const messages = readSessionMessages(entry.sessionId, storePath, entry.sessionFile);
				const lastHumanMessage = [...messages].toReversed().find((msg) => msg?.role === "user");
				const configChangeDetected = messages.some((msg) => {
					if (msg?.role !== "assistant") return false;
					const text = extractMessageText(msg);
					return typeof text === "string" && configChangePattern.test(text);
				});
				if (await resumeOrphanedSession({
					sessionKey: childSessionKey,
					task: runRecord.task,
					lastHumanMessage: extractMessageText(lastHumanMessage),
					configChangeHint: configChangeDetected ? "\n\n[config changes from your previous run were already applied — do not re-modify openclaw.json or restart the gateway]" : void 0,
					originalRunId: runId,
					originalRun: runRecord
				})) {
					resumedSessionKeys.add(childSessionKey);
					try {
						await updateSessionStore(storePath, (currentStore) => {
							const current = currentStore[childSessionKey];
							if (current) {
								current.abortedLastRun = false;
								current.updatedAt = Date.now();
								currentStore[childSessionKey] = current;
							}
						});
					} catch (err) {
						log.warn(`resume succeeded but failed to update session store for ${childSessionKey}: ${String(err)}`);
					}
					result.recovered++;
				} else {
					log.warn(`resume failed for ${childSessionKey}; abortedLastRun flag preserved for retry on next restart`);
					result.failed++;
				}
			} catch (err) {
				log.warn(`error processing orphaned session ${childSessionKey}: ${String(err)}`);
				result.failed++;
			}
		}
	} catch (err) {
		log.warn(`orphan recovery scan failed: ${String(err)}`);
		if (result.failed === 0) result.failed = 1;
	}
	if (result.recovered > 0 || result.failed > 0) log.info(`orphan recovery complete: recovered=${result.recovered} failed=${result.failed} skipped=${result.skipped}`);
	return result;
}
/** Maximum number of retry attempts for orphan recovery. */
const MAX_RECOVERY_RETRIES = 3;
/** Backoff multiplier between retries (exponential). */
const RETRY_BACKOFF_MULTIPLIER = 2;
/**
* Schedule orphan recovery after a delay, with retry logic.
* The delay gives the gateway time to fully bootstrap after restart.
* If recovery fails (e.g. gateway not yet ready), retries with exponential backoff.
*/
function scheduleOrphanRecovery(params) {
	const initialDelay = params.delayMs ?? DEFAULT_RECOVERY_DELAY_MS;
	const maxRetries = params.maxRetries ?? MAX_RECOVERY_RETRIES;
	const resumedSessionKeys = /* @__PURE__ */ new Set();
	const attemptRecovery = (attempt, delay) => {
		setTimeout(() => {
			recoverOrphanedSubagentSessions({
				...params,
				resumedSessionKeys
			}).then((result) => {
				if (result.failed > 0 && attempt < maxRetries) {
					const nextDelay = delay * RETRY_BACKOFF_MULTIPLIER;
					log.info(`orphan recovery had ${result.failed} failure(s); retrying in ${nextDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
					attemptRecovery(attempt + 1, nextDelay);
				}
			}).catch((err) => {
				if (attempt < maxRetries) {
					const nextDelay = delay * RETRY_BACKOFF_MULTIPLIER;
					log.warn(`scheduled orphan recovery failed: ${String(err)}; retrying in ${nextDelay}ms (attempt ${attempt + 1}/${maxRetries})`);
					attemptRecovery(attempt + 1, nextDelay);
				} else log.warn(`scheduled orphan recovery failed after ${maxRetries} retries: ${String(err)}`);
			});
		}, delay).unref?.();
	};
	attemptRecovery(0, initialDelay);
}
//#endregion
export { scheduleOrphanRecovery };
