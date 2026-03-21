export declare function clearCredentialsCache(): void;
export declare function extractGeminiCliCredentials(): {
    clientId: string;
    clientSecret: string;
} | null;
export declare function resolveOAuthClientConfig(): {
    clientId: string;
    clientSecret?: string;
};
