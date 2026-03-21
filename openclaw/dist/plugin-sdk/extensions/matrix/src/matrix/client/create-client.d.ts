import type { MatrixClient } from "@vector-im/matrix-bot-sdk";
export declare function createMatrixClient(params: {
    homeserver: string;
    userId: string;
    accessToken: string;
    encryption?: boolean;
    localTimeoutMs?: number;
    accountId?: string | null;
}): Promise<MatrixClient>;
