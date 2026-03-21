export type PluginsCommand = {
    action: "list";
} | {
    action: "show";
    name?: string;
} | {
    action: "enable";
    name: string;
} | {
    action: "disable";
    name: string;
} | {
    action: "error";
    message: string;
};
export declare function parsePluginsCommand(raw: string): PluginsCommand | null;
