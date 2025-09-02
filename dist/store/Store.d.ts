import { Node, SuperNode } from "@paraflux/core";
import { NodeStore } from "./nodeStore";
import { ViewStore } from "./viewsStore";
import LiveNOM from "../NOM/LiveNom";
declare class GlobalStore {
    private static instance;
    root: SuperNode | Node | null;
    private App;
    viewStore: ViewStore;
    nodesStore: NodeStore;
    liveNom: LiveNOM;
    private constructor();
    private clearModuleCache;
    loadAppRoot(): Promise<void>;
    updateRoot(buildPath?: string): Promise<void>;
    static getInstance(): GlobalStore;
}
declare const globalStore: GlobalStore;
export default globalStore;
