import type { MatrixStoragePaths } from "./types.js";
export declare const DEFAULT_ACCOUNT_KEY = "default";
export declare function resolveMatrixStoragePaths(params: {
    homeserver: string;
    userId: string;
    accessToken: string;
    accountId?: string | null;
    env?: NodeJS.ProcessEnv;
}): MatrixStoragePaths;
export declare function maybeMigrateLegacyStorage(params: {
    storagePaths: MatrixStoragePaths;
    env?: NodeJS.ProcessEnv;
}): void;
export declare function writeStorageMeta(params: {
    storagePaths: MatrixStoragePaths;
    homeserver: string;
    userId: string;
    accountId?: string | null;
}): void;
