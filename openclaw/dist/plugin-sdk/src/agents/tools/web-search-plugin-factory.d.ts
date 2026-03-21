import type { OpenClawConfig } from "../../config/config.js";
import type { WebSearchProviderPlugin } from "../../plugins/types.js";
type ConfiguredWebSearchProvider = NonNullable<NonNullable<NonNullable<OpenClawConfig["tools"]>["web"]>["search"]>["provider"];
export declare function createPluginBackedWebSearchProvider(provider: Omit<WebSearchProviderPlugin, "createTool"> & {
    id: ConfiguredWebSearchProvider;
}): WebSearchProviderPlugin;
export declare function getTopLevelCredentialValue(searchConfig?: Record<string, unknown>): unknown;
export declare function setTopLevelCredentialValue(searchConfigTarget: Record<string, unknown>, value: unknown): void;
export declare function getScopedCredentialValue(searchConfig: Record<string, unknown> | undefined, key: string): unknown;
export declare function setScopedCredentialValue(searchConfigTarget: Record<string, unknown>, key: string, value: unknown): void;
export {};
