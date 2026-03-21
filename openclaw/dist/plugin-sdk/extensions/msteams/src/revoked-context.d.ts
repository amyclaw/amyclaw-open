export declare function withRevokedProxyFallback<T>(params: {
    run: () => Promise<T>;
    onRevoked: () => Promise<T>;
    onRevokedLog?: () => void;
}): Promise<T>;
