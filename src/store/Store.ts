import path from "path";
import { Node, SuperNode } from "@paraflux/core";
import { createRoot } from "@paraflux/core/dist/functions/createRoot";
import { NodeStore } from "./nodeStore";
import { ViewStore } from "./viewsStore";

class GlobalStore {
  private static instance: GlobalStore | null = null;
  root: SuperNode | Node;
  public viewStore: ViewStore = new ViewStore();
  public nodesStore: NodeStore = new NodeStore();

  private constructor() {
    this.root = this.loadApp();
  }

  private loadApp() {
    const appDir = path.resolve(process.cwd(), ".paraflux/cache/App.js");
    delete require.cache[require.resolve(appDir)];
    const mod = require(appDir);
    const App = mod.default ?? mod.App;
    return createRoot(App);
  }

  public static getInstance(): GlobalStore {
    if (!GlobalStore.instance) {
      GlobalStore.instance = new GlobalStore();
    }
    return GlobalStore.instance;
  }

  public updateRoot() {
    this.root = this.loadApp();
  }
}

const globalStore = GlobalStore.getInstance();
export default globalStore;
