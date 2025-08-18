import { Node, SuperNode } from "@paraflux/core";
import { createRoot } from "@paraflux/core/dist/functions/createRoot";
import { NodeStore } from "./nodeStore";
import { ViewStore } from "./viewsStore";
import path from "path";

class GlobalStore {
  private static instance: GlobalStore | null = null;
  root: SuperNode | Node;
  public viewStore: ViewStore = new ViewStore();
  public nodesStore: NodeStore = new NodeStore();

  private constructor() {
    const appDir = path.resolve(process.cwd(), "src/App.ts");
    const mod = require(appDir);
    const App = mod.default ?? mod.App;
    this.root = createRoot(App);
  }

  public static getInstance(): GlobalStore {
    if (!GlobalStore.instance) {
      GlobalStore.instance = new GlobalStore();
    }
    return GlobalStore.instance;
  }

  public getRoot(): SuperNode | Node {
    return this.root;
  }

  public async updateRoot() {
    const mod = await import("./App?" + Date.now());
    const App = mod.default ?? mod.App;
    this.root = createRoot(App);
  }
}

const globalStore = GlobalStore.getInstance();

export default globalStore;
