import type { MatrixClient } from "@vector-im/matrix-bot-sdk";
export declare const MATRIX_CLIENT_STARTUP_GRACE_MS = 2000;
export declare function startMatrixClientWithGrace(params: {
    client: Pick<MatrixClient, "start">;
    graceMs?: number;
    onError?: (err: unknown) => void;
}): Promise<void>;
