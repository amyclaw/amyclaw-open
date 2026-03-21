import type { OpenClawConfig } from "../../config/config.js";
import type { ChannelSetupDmPolicy } from "./setup-wizard-types.js";
import type { ChannelSetupWizard } from "./setup-wizard.js";
type PromptAllowFromParams = Parameters<NonNullable<ChannelSetupDmPolicy["promptAllowFrom"]>>[0];
type ResolveAllowFromEntriesParams = Parameters<NonNullable<ChannelSetupWizard["allowFrom"]>["resolveEntries"]>[0];
type ResolveAllowFromEntriesResult = Awaited<ReturnType<NonNullable<ChannelSetupWizard["allowFrom"]>["resolveEntries"]>>;
type ResolveGroupAllowlistParams = Parameters<NonNullable<NonNullable<ChannelSetupWizard["groupAccess"]>["resolveAllowlist"]>>[0];
export declare function createAllowlistSetupWizardProxy<TGroupResolved>(params: {
    loadWizard: () => Promise<ChannelSetupWizard>;
    createBase: (handlers: {
        promptAllowFrom: (params: PromptAllowFromParams) => Promise<OpenClawConfig>;
        resolveAllowFromEntries: (params: ResolveAllowFromEntriesParams) => Promise<ResolveAllowFromEntriesResult>;
        resolveGroupAllowlist: (params: ResolveGroupAllowlistParams) => Promise<TGroupResolved>;
    }) => ChannelSetupWizard;
    fallbackResolvedGroupAllowlist: (entries: string[]) => TGroupResolved;
}): ChannelSetupWizard;
export {};
