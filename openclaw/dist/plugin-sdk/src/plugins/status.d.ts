import { loadConfig } from "../config/config.js";
import type { PluginRegistry } from "./registry.js";
export type PluginStatusReport = PluginRegistry & {
    workspaceDir?: string;
};
export declare function buildPluginStatusReport(params?: {
    config?: ReturnType<typeof loadConfig>;
    workspaceDir?: string;
    /** Use an explicit env when plugin roots should resolve independently from process.env. */
    env?: NodeJS.ProcessEnv;
}): PluginStatusReport;
