import { Node } from "@paraflux/core";
type StoredNode = {
    packageName: string;
    nodeKey: string;
    node: Node;
};
export declare class NodeStore {
    nodeMap: Record<string, StoredNode>;
    nodeKeys: string[];
    addView(key: string, view: StoredNode): void;
    getView(key: string): StoredNode | undefined;
    getAllViews(): StoredNode[];
    updateView(key: string, value: StoredNode): boolean;
    removeView(key: string): void;
}
export {};
