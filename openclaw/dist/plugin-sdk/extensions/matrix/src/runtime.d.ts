import type { PluginRuntime } from "openclaw/plugin-sdk/matrix";
declare const setMatrixRuntime: (next: PluginRuntime) => void, getMatrixRuntime: () => PluginRuntime;
export { getMatrixRuntime, setMatrixRuntime };
