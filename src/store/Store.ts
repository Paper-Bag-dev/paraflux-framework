import path from "path";
import { Node, SuperNode } from "@paraflux/core";
import { createRoot } from "@paraflux/core/dist/functions/createRoot";
import { NodeStore } from "./nodeStore";
import { ViewStore } from "./viewsStore";

class GlobalStore {
  private static instance: GlobalStore | null = null;
  root: SuperNode | Node | null = null;
  public viewStore: ViewStore = new ViewStore();
  public nodesStore: NodeStore = new NodeStore();

  private constructor() {
  }

private async loadApp() {
  const appDir = path.resolve(process.cwd(), ".paraflux/cache/App.js");
  delete require.cache[require.resolve(appDir)];

  // TypeScript doesn't know types, so cast to any
  const mod: any = await import(appDir); 
  const App = mod.default ?? mod.App;
  return createRoot(App);
}


  public static getInstance(): GlobalStore {
    if (!GlobalStore.instance) {
      GlobalStore.instance = new GlobalStore();
    }
    return GlobalStore.instance;
  }

  public async updateRoot() {
    this.root = await this.loadApp();
  }
}

const globalStore = GlobalStore.getInstance();
export default globalStore;
