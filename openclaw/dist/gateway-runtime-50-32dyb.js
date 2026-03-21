import { _ as GATEWAY_CLIENT_MODES, v as GATEWAY_CLIENT_NAMES } from "./message-channel-C4icaB2h.js";
import { u as GatewayClient } from "./method-scopes-BAswg77K.js";
import { l as resolveGatewayCredentialsWithSecretInputs, t as buildGatewayConnectionDetails } from "./call-x5WvUEsz.js";
//#region src/gateway/channel-status-patches.ts
function createConnectedChannelStatusPatch(at = Date.now()) {
	return {
		connected: true,
		lastConnectedAt: at,
		lastEventAt: at
	};
}
//#endregion
//#region src/gateway/connection-auth.ts
function toGatewayCredentialOptions(params) {
	return {
		cfg: params.cfg,
		env: params.env,
		explicitAuth: params.explicitAuth,
		urlOverride: params.urlOverride,
		urlOverrideSource: params.urlOverrideSource,
		modeOverride: params.modeOverride,
		includeLegacyEnv: params.includeLegacyEnv,
		localTokenPrecedence: params.localTokenPrecedence,
		localPasswordPrecedence: params.localPasswordPrecedence,
		remoteTokenPrecedence: params.remoteTokenPrecedence,
		remotePasswordPrecedence: params.remotePasswordPrecedence,
		remoteTokenFallback: params.remoteTokenFallback,
		remotePasswordFallback: params.remotePasswordFallback
	};
}
async function resolveGatewayConnectionAuth(params) {
	return await resolveGatewayCredentialsWithSecretInputs({
		config: params.config,
		...toGatewayCredentialOptions({
			...params,
			cfg: params.config
		})
	});
}
//#endregion
//#region src/gateway/operator-approvals-client.ts
async function createOperatorApprovalsGatewayClient(params) {
	const { url: gatewayUrl, urlSource } = buildGatewayConnectionDetails({
		config: params.config,
		url: params.gatewayUrl
	});
	const gatewayUrlOverrideSource = urlSource === "cli --url" ? "cli" : urlSource === "env OPENCLAW_GATEWAY_URL" ? "env" : void 0;
	const auth = await resolveGatewayConnectionAuth({
		config: params.config,
		env: process.env,
		urlOverride: gatewayUrlOverrideSource ? gatewayUrl : void 0,
		urlOverrideSource: gatewayUrlOverrideSource
	});
	return new GatewayClient({
		url: gatewayUrl,
		token: auth.token,
		password: auth.password,
		clientName: GATEWAY_CLIENT_NAMES.GATEWAY_CLIENT,
		clientDisplayName: params.clientDisplayName,
		mode: GATEWAY_CLIENT_MODES.BACKEND,
		scopes: ["operator.approvals"],
		onEvent: params.onEvent,
		onHelloOk: params.onHelloOk,
		onConnectError: params.onConnectError,
		onClose: params.onClose
	});
}
//#endregion
export { resolveGatewayConnectionAuth as n, createConnectedChannelStatusPatch as r, createOperatorApprovalsGatewayClient as t };
