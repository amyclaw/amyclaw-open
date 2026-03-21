export type TlonAccountFieldsInput = {
    ship?: string;
    url?: string;
    code?: string;
    allowPrivateNetwork?: boolean;
    groupChannels?: string[];
    dmAllowlist?: string[];
    autoDiscoverChannels?: boolean;
    ownerShip?: string;
};
export declare function buildTlonAccountFields(input: TlonAccountFieldsInput): {
    ownerShip?: string | undefined;
    autoDiscoverChannels?: boolean | undefined;
    dmAllowlist?: string[] | undefined;
    groupChannels?: string[] | undefined;
    allowPrivateNetwork?: boolean | undefined;
    code?: string | undefined;
    url?: string | undefined;
    ship?: string | undefined;
};
