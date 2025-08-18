import { Node, SuperNode } from "@paraflux/core";
import { NodeStore } from "./nodeStore";
import { ViewStore } from "./viewsStore";
declare class GlobalStore {
    private static instance;
    root: SuperNode | Node;
    viewStore: ViewStore;
    nodesStore: NodeStore;
    private constructor();
    static getInstance(): GlobalStore;
    getRoot(): SuperNode | Node;
    updateRoot(): Promise<void>;
}
declare const globalStore: GlobalStore;
export default globalStore;
