import type { DirectoryConfigParams } from "openclaw/plugin-sdk/channel-runtime";
import type { ChannelDirectoryEntry } from "openclaw/plugin-sdk/channel-runtime";
export declare function listDiscordDirectoryGroupsLive(params: DirectoryConfigParams): Promise<ChannelDirectoryEntry[]>;
export declare function listDiscordDirectoryPeersLive(params: DirectoryConfigParams): Promise<ChannelDirectoryEntry[]>;
