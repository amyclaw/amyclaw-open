import { type ChannelSetupAdapter, type ChannelSetupInput, type ChannelSetupWizard, type OpenClawConfig } from "openclaw/plugin-sdk/setup";
export type TlonSetupInput = ChannelSetupInput & {
    ship?: string;
    url?: string;
    code?: string;
    allowPrivateNetwork?: boolean;
    groupChannels?: string[];
    dmAllowlist?: string[];
    autoDiscoverChannels?: boolean;
    ownerShip?: string;
};
type TlonSetupWizardBaseParams = {
    resolveConfigured: (params: {
        cfg: OpenClawConfig;
    }) => boolean | Promise<boolean>;
    resolveStatusLines?: (params: {
        cfg: OpenClawConfig;
        configured: boolean;
    }) => string[] | Promise<string[]>;
    finalize: NonNullable<ChannelSetupWizard["finalize"]>;
};
export declare function createTlonSetupWizardBase(params: TlonSetupWizardBaseParams): ChannelSetupWizard;
export declare function resolveTlonSetupConfigured(cfg: OpenClawConfig): Promise<boolean>;
export declare function resolveTlonSetupStatusLines(cfg: OpenClawConfig): Promise<string[]>;
export declare function applyTlonSetupConfig(params: {
    cfg: OpenClawConfig;
    accountId: string;
    input: TlonSetupInput;
}): OpenClawConfig;
export declare const tlonSetupAdapter: ChannelSetupAdapter;
export {};
