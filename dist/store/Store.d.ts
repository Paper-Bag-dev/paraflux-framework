import { Node, SuperNode } from "@paraflux/core";
import { NodeStore } from "./nodeStore";
import { ViewStore } from "./viewsStore";
declare class GlobalStore {
    private static instance;
    root: SuperNode | Node | null;
    viewStore: ViewStore;
    nodesStore: NodeStore;
    private constructor();
    private getAppPath;
    private loadApp;
    static getInstance(): GlobalStore;
    updateRoot(): Promise<void>;
}
export declare const globalStore: GlobalStore;
export default globalStore;
