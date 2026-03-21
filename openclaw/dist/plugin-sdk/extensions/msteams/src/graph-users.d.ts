import { type GraphUser } from "./graph.js";
export declare function searchGraphUsers(params: {
    token: string;
    query: string;
    top?: number;
}): Promise<GraphUser[]>;
