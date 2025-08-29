import path from "path";
import { Node, SuperNode } from "@paraflux/core";
import { createRoot } from "@paraflux/core/dist/functions/createRoot";
import { NodeStore } from "./nodeStore";
import { ViewStore } from "./viewsStore";
import { execTreeNaive } from "@paraflux/core";

class GlobalStore {
  private static instance: GlobalStore | null = null;

  public root: SuperNode | Node | null = null;
  public viewStore: ViewStore = new ViewStore();
  public nodesStore: NodeStore = new NodeStore();

  private constructor() {}

  private getAppPath() {
    const appDir = path.resolve(process.cwd(), ".paraflux/cache/App.js");
    return `${appDir}?t=${Date.now()}`;
  }

  private async loadApp() {
    const mod: any = await import(this.getAppPath());
    const AppClass = mod.default ?? mod.App;

    this.root = createRoot(AppClass);
    this.root.render();
    return this.root;
  }

  public static getInstance(): GlobalStore {
    if (!GlobalStore.instance) {
      GlobalStore.instance = new GlobalStore();
    }
    return GlobalStore.instance;
  }

  public async updateRoot() {
    await this.loadApp();
    if (this.root) {
      await execTreeNaive(this.root);
    }
  }
}

export const globalStore = GlobalStore.getInstance();
export default globalStore;
