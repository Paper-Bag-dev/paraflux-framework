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
    const resolvedPath = require.resolve(modulePath);
    const mod = require.cache[resolvedPath];
    if (!mod) return;

    // Recursively clear children
    if (mod.children) {
      mod.children.forEach((child) => this.clearModuleCache(child.id));
    }

    delete require.cache[resolvedPath];
  }

  private async loadApp(dir = ".paraflux/cache/App.js") {
    const moduleDir = path.resolve(process.cwd(), dir);

    // Clear the cache recursively
    this.clearModuleCache(moduleDir);

    // Import fresh module
    const mod: any = await import(moduleDir);
    this.App = mod.default ?? mod.App;

    // Create and render root
    this.root = createRoot(this.App);
    this.root.render();

    // Execute tree
    if (this.root) await execTreeNaive(this.root);

    return this.root;
  }

  public static getInstance(): GlobalStore {
    if (!GlobalStore.instance) {
      GlobalStore.instance = new GlobalStore();
    }
    return GlobalStore.instance;
  }

  public async updateRoot(buildPath: string = "/cache/App.js") {
    const outPath = convertPathForCacheFn(buildPath);
    await this.loadApp(outPath);
  }
}

const globalStore = GlobalStore.getInstance();
export default globalStore;
