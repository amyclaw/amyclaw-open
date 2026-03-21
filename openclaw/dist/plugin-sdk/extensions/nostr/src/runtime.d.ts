import type { PluginRuntime } from "openclaw/plugin-sdk/nostr";
declare const setNostrRuntime: (next: PluginRuntime) => void, getNostrRuntime: () => PluginRuntime;
export { getNostrRuntime, setNostrRuntime };
