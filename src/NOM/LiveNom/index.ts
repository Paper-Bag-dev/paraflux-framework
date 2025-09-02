import { execTreeNaive, SuperNode } from "@paraflux/core";
import { createRoot } from "@paraflux/core/dist/functions/createRoot";
import path from "path";
import convertPathForCacheFn from "../../utils/convertPathForCacheFn";

class LiveNOM {
  private root: SuperNode | null = null;
  private App: any;

  constructor() {}

  private async loadApp(dir = ".paraflux/cache/App.js") {
    const moduleDir = path.resolve(process.cwd(), dir);
    delete require.cache[require.resolve(moduleDir)];

    // TypeScript doesn't know types, so cast to any
    const mod: any = await import(moduleDir);
    this.App = mod.default ?? mod.App;
    this.root = createRoot(this.App);
    this.root.render();
    return this.root;
  }

  public async updateRoot(buildPath: string) {
    const outPath = convertPathForCacheFn(buildPath);
    await this.loadApp(outPath);
    if (this.root) {
      execTreeNaive(this.root);
    }
  }
}

export default LiveNOM;
