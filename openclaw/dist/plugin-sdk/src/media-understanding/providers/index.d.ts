import type { OpenClawConfig } from "../../config/config.js";
import type { MediaUnderstandingProvider } from "../types.js";
export declare function normalizeMediaProviderId(id: string): string;
export declare function buildMediaUnderstandingRegistry(overrides?: Record<string, MediaUnderstandingProvider>, cfg?: OpenClawConfig): Map<string, MediaUnderstandingProvider>;
export declare function getMediaUnderstandingProvider(id: string, registry: Map<string, MediaUnderstandingProvider>): MediaUnderstandingProvider | undefined;
