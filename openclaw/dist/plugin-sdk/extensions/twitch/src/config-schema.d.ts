import { z } from "zod";
/**
 * Twitch plugin configuration schema
 *
 * Supports two mutually exclusive patterns:
 * 1. Simplified single-account: username, accessToken, clientId, channel at top level
 * 2. Multi-account: accounts object with named account configs
 *
 * The union ensures clear discrimination between the two modes.
 */
export declare const TwitchConfigSchema: z.ZodUnion<readonly [z.ZodIntersection<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    markdown: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        tables: z.ZodOptional<z.ZodEnum<{
            off: "off";
            bullets: "bullets";
            code: "code";
        }>>;
    }, z.core.$strict>>>;
}, z.core.$strip>, z.ZodObject<{
    username: z.ZodString;
    accessToken: z.ZodString;
    clientId: z.ZodOptional<z.ZodString>;
    channel: z.ZodString;
    enabled: z.ZodOptional<z.ZodBoolean>;
    allowFrom: z.ZodOptional<z.ZodArray<z.ZodString>>;
    allowedRoles: z.ZodOptional<z.ZodArray<z.ZodEnum<{
        all: "all";
        owner: "owner";
        moderator: "moderator";
        vip: "vip";
        subscriber: "subscriber";
    }>>>;
    requireMention: z.ZodOptional<z.ZodBoolean>;
    responsePrefix: z.ZodOptional<z.ZodString>;
    clientSecret: z.ZodOptional<z.ZodString>;
    refreshToken: z.ZodOptional<z.ZodString>;
    expiresIn: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    obtainmentTimestamp: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>>, z.ZodIntersection<z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    enabled: z.ZodOptional<z.ZodBoolean>;
    markdown: z.ZodOptional<z.ZodOptional<z.ZodObject<{
        tables: z.ZodOptional<z.ZodEnum<{
            off: "off";
            bullets: "bullets";
            code: "code";
        }>>;
    }, z.core.$strict>>>;
}, z.core.$strip>, z.ZodObject<{
    accounts: z.ZodRecord<z.ZodString, z.ZodObject<{
        username: z.ZodString;
        accessToken: z.ZodString;
        clientId: z.ZodOptional<z.ZodString>;
        channel: z.ZodString;
        enabled: z.ZodOptional<z.ZodBoolean>;
        allowFrom: z.ZodOptional<z.ZodArray<z.ZodString>>;
        allowedRoles: z.ZodOptional<z.ZodArray<z.ZodEnum<{
            all: "all";
            owner: "owner";
            moderator: "moderator";
            vip: "vip";
            subscriber: "subscriber";
        }>>>;
        requireMention: z.ZodOptional<z.ZodBoolean>;
        responsePrefix: z.ZodOptional<z.ZodString>;
        clientSecret: z.ZodOptional<z.ZodString>;
        refreshToken: z.ZodOptional<z.ZodString>;
        expiresIn: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        obtainmentTimestamp: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>>;
}, z.core.$strip>>]>;
