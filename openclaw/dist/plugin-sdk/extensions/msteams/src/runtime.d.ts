import type { PluginRuntime } from "openclaw/plugin-sdk/msteams";
declare const setMSTeamsRuntime: (next: PluginRuntime) => void, getMSTeamsRuntime: () => PluginRuntime;
export { getMSTeamsRuntime, setMSTeamsRuntime };
