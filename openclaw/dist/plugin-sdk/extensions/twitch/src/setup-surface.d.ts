/**
 * Twitch setup wizard surface for CLI setup.
 */
import { type ChannelSetupAdapter, type ChannelSetupDmPolicy, type ChannelSetupWizard, type OpenClawConfig, type WizardPrompter } from "openclaw/plugin-sdk/setup";
import type { TwitchAccountConfig } from "./types.js";
export declare function setTwitchAccount(cfg: OpenClawConfig, account: Partial<TwitchAccountConfig>): OpenClawConfig;
export declare function promptToken(prompter: WizardPrompter, account: TwitchAccountConfig | null, envToken: string | undefined): Promise<string>;
export declare function promptUsername(prompter: WizardPrompter, account: TwitchAccountConfig | null): Promise<string>;
export declare function promptClientId(prompter: WizardPrompter, account: TwitchAccountConfig | null): Promise<string>;
export declare function promptChannelName(prompter: WizardPrompter, account: TwitchAccountConfig | null): Promise<string>;
export declare function promptRefreshTokenSetup(prompter: WizardPrompter, account: TwitchAccountConfig | null): Promise<{
    clientSecret?: string;
    refreshToken?: string;
}>;
export declare function configureWithEnvToken(cfg: OpenClawConfig, prompter: WizardPrompter, account: TwitchAccountConfig | null, envToken: string, forceAllowFrom: boolean, dmPolicy: ChannelSetupDmPolicy): Promise<{
    cfg: OpenClawConfig;
} | null>;
export declare const twitchSetupAdapter: ChannelSetupAdapter;
export declare const twitchSetupWizard: ChannelSetupWizard;
