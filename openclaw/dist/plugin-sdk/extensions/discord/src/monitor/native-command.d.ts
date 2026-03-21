import { Button, Command, StringSelectMenu } from "@buape/carbon";
import type { OpenClawConfig, loadConfig } from "openclaw/plugin-sdk/config-runtime";
import type { NativeCommandSpec } from "openclaw/plugin-sdk/reply-runtime";
import type { ThreadBindingManager } from "./thread-bindings.js";
type DiscordConfig = NonNullable<OpenClawConfig["channels"]>["discord"];
type DiscordCommandArgContext = {
    cfg: ReturnType<typeof loadConfig>;
    discordConfig: DiscordConfig;
    accountId: string;
    sessionPrefix: string;
    threadBindings: ThreadBindingManager;
};
type DiscordModelPickerContext = DiscordCommandArgContext;
export declare function createDiscordCommandArgFallbackButton(params: DiscordCommandArgContext): Button;
export declare function createDiscordModelPickerFallbackButton(params: DiscordModelPickerContext): Button;
export declare function createDiscordModelPickerFallbackSelect(params: DiscordModelPickerContext): StringSelectMenu;
export declare function createDiscordNativeCommand(params: {
    command: NativeCommandSpec;
    cfg: ReturnType<typeof loadConfig>;
    discordConfig: DiscordConfig;
    accountId: string;
    sessionPrefix: string;
    ephemeralDefault: boolean;
    threadBindings: ThreadBindingManager;
}): Command;
export {};
