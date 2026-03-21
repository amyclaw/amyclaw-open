import type { PluginRuntime } from "openclaw/plugin-sdk/feishu";
declare const setFeishuRuntime: (next: PluginRuntime) => void, getFeishuRuntime: () => PluginRuntime;
export { getFeishuRuntime, setFeishuRuntime };
