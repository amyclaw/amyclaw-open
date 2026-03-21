import { z } from "zod";
/**
 * NIP-01 profile metadata schema
 * https://github.com/nostr-protocol/nips/blob/master/01.md
 */
export declare const NostrProfileSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    displayName: z.ZodOptional<z.ZodString>;
    about: z.ZodOptional<z.ZodString>;
    picture: z.ZodOptional<z.ZodString>;
    banner: z.ZodOptional<z.ZodString>;
    website: z.ZodOptional<z.ZodString>;
    nip05: z.ZodOptional<z.ZodString>;
    lud16: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type NostrProfile = z.infer<typeof NostrProfileSchema>;
/**
 * Zod schema for channels.nostr.* configuration
 */
export declare const NostrConfigSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    defaultAccount: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    markdown: z.ZodOptional<z.ZodObject<{
        tables: z.ZodOptional<z.ZodEnum<{
            off: "off";
            bullets: "bullets";
            code: "code";
        }>>;
    }, z.core.$strict>>;
    privateKey: z.ZodOptional<z.ZodString>;
    relays: z.ZodOptional<z.ZodArray<z.ZodString>>;
    dmPolicy: z.ZodOptional<z.ZodEnum<{
        allowlist: "allowlist";
        open: "open";
        disabled: "disabled";
        pairing: "pairing";
    }>>;
    allowFrom: z.ZodOptional<z.ZodArray<z.ZodUnion<readonly [z.ZodString, z.ZodNumber]>>>;
    profile: z.ZodOptional<z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        displayName: z.ZodOptional<z.ZodString>;
        about: z.ZodOptional<z.ZodString>;
        picture: z.ZodOptional<z.ZodString>;
        banner: z.ZodOptional<z.ZodString>;
        website: z.ZodOptional<z.ZodString>;
        nip05: z.ZodOptional<z.ZodString>;
        lud16: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type NostrConfig = z.infer<typeof NostrConfigSchema>;
/**
 * JSON Schema for Control UI (converted from Zod)
 */
export declare const nostrChannelConfigSchema: import("openclaw/plugin-sdk").ChannelConfigSchema;
