import { Node } from "@paraflux/core";
type StoredView = {
    packageName: string;
    value: Node;
};
export declare class ViewStore {
    viewMap: Record<string, StoredView>;
    viewKeys: string[];
    addView(key: string, view: StoredView): void;
    getView(key: string): StoredView | undefined;
    getAllViews(): StoredView[];
    updateView(key: string, value: StoredView): boolean;
    removeView(key: string): void;
}
export {};
