import type { DirectoryConfigParams } from "openclaw/plugin-sdk/channel-runtime";
import type { ChannelDirectoryEntry } from "openclaw/plugin-sdk/channel-runtime";
export declare function listSlackDirectoryPeersLive(params: DirectoryConfigParams): Promise<ChannelDirectoryEntry[]>;
export declare function listSlackDirectoryGroupsLive(params: DirectoryConfigParams): Promise<ChannelDirectoryEntry[]>;
