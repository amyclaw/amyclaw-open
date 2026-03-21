export type UrbitBaseUrlValidation = {
    ok: true;
    baseUrl: string;
    hostname: string;
} | {
    ok: false;
    error: string;
};
export declare function validateUrbitBaseUrl(raw: string): UrbitBaseUrlValidation;
export declare function isBlockedUrbitHostname(hostname: string): boolean;
