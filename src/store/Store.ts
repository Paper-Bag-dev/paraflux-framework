import path from "path";
import { Node, SuperNode } from "@paraflux/core";
import { createRoot } from "@paraflux/core/dist/functions/createRoot";
import { NodeStore } from "./nodeStore";
import { ViewStore } from "./viewsStore";
import { execTreeNaive } from "@paraflux/core";
import convertPathForCacheFn from "../utils/convertPathForCacheFn";
import LiveNOM from "../NOM/LiveNom";

class GlobalStore {
  private static instance: GlobalStore | null = null;
  root: SuperNode | Node | null = null;
  private App: any;
  public viewStore: ViewStore = new ViewStore();
  public nodesStore: NodeStore = new NodeStore();
  public liveNom: LiveNOM = new LiveNOM();

  private constructor() {}

  // Recursive cache clearing
  private clearModuleCache(modulePath: string) {
    try {
      const resolvedPath = require.resolve(modulePath);
      const mod = require.cache[resolvedPath];
      if (!mod) return;

      if (resolvedPath.includes("node_modules")) return;

      delete require.cache[resolvedPath];

      for (const m of Object.values(require.cache)) {
        if (!m) continue;
        if (m.children.some((c) => c.id === resolvedPath)) {
          this.clearModuleCache(m.id);
        }
      }
    } catch (error) {
    }
  }

  public async loadAppRoot() {
    const appRootPath = path.resolve(process.cwd(), ".paraflux/cache/App.js");
    const mod: any = await import(appRootPath);
    this.App = mod.default ?? mod.App;
    this.root = createRoot(this.App);
    this.root.render();
  }

  public async updateRoot(buildPath: string = ".paraflux/cache/App.js") {
    try {
      if (this.root === null) throw new Error("Root is Null");
      const outPath = convertPathForCacheFn(buildPath);

      const appRootPath = path.resolve(process.cwd(), ".paraflux/cache/App.js");
      this.clearModuleCache(outPath);

      const mod: any = await import(appRootPath);
      this.App = mod.default ?? mod.App;
      this.root.render();

      // Execute full tree code naively
      if (this.root) await execTreeNaive(this.root);
    } catch (error) {
      console.log("Error Updating App: ", error);
    }
  }

  public static getInstance(): GlobalStore {
    if (!GlobalStore.instance) {
      GlobalStore.instance = new GlobalStore();
    }
    return GlobalStore.instance;
  }
}

const globalStore = GlobalStore.getInstance();
export default globalStore;
