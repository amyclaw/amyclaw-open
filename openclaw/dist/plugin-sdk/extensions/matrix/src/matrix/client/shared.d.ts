import type { MatrixClient } from "@vector-im/matrix-bot-sdk";
import type { CoreConfig } from "../../types.js";
import type { MatrixAuth } from "./types.js";
export declare function resolveSharedMatrixClient(params?: {
    cfg?: CoreConfig;
    env?: NodeJS.ProcessEnv;
    timeoutMs?: number;
    auth?: MatrixAuth;
    startClient?: boolean;
    accountId?: string | null;
}): Promise<MatrixClient>;
export declare function waitForMatrixSync(_params: {
    client: MatrixClient;
    timeoutMs?: number;
    abortSignal?: AbortSignal;
}): Promise<void>;
export declare function stopSharedClient(key?: string): void;
/**
 * Stop the shared client for a specific account.
 * Use this instead of stopSharedClient() when shutting down a single account
 * to avoid stopping all accounts.
 */
export declare function stopSharedClientForAccount(auth: MatrixAuth, accountId?: string | null): void;
