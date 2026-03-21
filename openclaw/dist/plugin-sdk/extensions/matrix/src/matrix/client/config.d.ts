import type { CoreConfig } from "../../types.js";
import type { MatrixAuth, MatrixResolvedConfig } from "./types.js";
/**
 * Resolve Matrix config for a specific account, with fallback to top-level config.
 * This supports both multi-account (channels.matrix.accounts.*) and
 * single-account (channels.matrix.*) configurations.
 */
export declare function resolveMatrixConfigForAccount(cfg?: CoreConfig, accountId?: string | null, env?: NodeJS.ProcessEnv): MatrixResolvedConfig;
/**
 * Single-account function for backward compatibility - resolves default account config.
 */
export declare function resolveMatrixConfig(cfg?: CoreConfig, env?: NodeJS.ProcessEnv): MatrixResolvedConfig;
export declare function resolveMatrixAuth(params?: {
    cfg?: CoreConfig;
    env?: NodeJS.ProcessEnv;
    accountId?: string | null;
}): Promise<MatrixAuth>;
