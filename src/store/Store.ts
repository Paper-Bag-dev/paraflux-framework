import path from "path";
import { Node, SuperNode } from "@paraflux/core";
import { createRoot } from "@paraflux/core/dist/functions/createRoot";
import { NodeStore } from "./nodeStore";
import { ViewStore } from "./viewsStore";
import convertPathForCacheFn from "../utils/convertPathForCacheFn";
import LiveNOM from "../NOM/LiveNom";
import { spawn, ChildProcess } from "node:child_process";

class GlobalStore {
  private static instance: GlobalStore | null = null;
  root: SuperNode | Node | null = null;
  private App: any;
  private ignoreFirstError: boolean = true;
  public viewStore: ViewStore = new ViewStore();
  public nodesStore: NodeStore = new NodeStore();
  public liveNom: LiveNOM = new LiveNOM();
  private execProcess: ChildProcess | null = null;

  private constructor() {}

  private runTreeInProcess(root: Node | SuperNode) {
    // Kill previous process if exists
    if (this.execProcess) {
      this.execProcess.kill("SIGTERM");
      this.execProcess = null;
    }

    // Create a temporary file that runs the tree
    const tempRunnerPath = require("path").resolve(
      process.cwd(),
      ".paraflux/cache/treeRunner.js"
    );

    // Write a small JS file dynamically
    const fs = require("fs");
    fs.writeFileSync(
      tempRunnerPath,
      `
      import { execTreeNaive } from '@paraflux/core';
      (async () => {
        try {
          const root = ${JSON.stringify(root, null, 2)};
          await execTreeNaive(root);
        } catch(e) {
          console.error("Tree execution error:", e);
          process.exit(1);
        }
      })();
      `
    );

    // Spawn a new Node process to run the tree
    this.execProcess = spawn(process.execPath, [tempRunnerPath], {
      stdio: "inherit", // pipes stdout/stderr to main terminal
    });

    this.execProcess.on("exit", (code) => {
      if (code !== 0) console.error("Tree process exited with code", code);
      this.execProcess = null;
    });

    this.execProcess.on("error", (err) => {
      console.error("Tree process error:", err);
      this.execProcess = null;
    });
  }


  public async loadAppRoot() {
    const appRootPath = path.resolve(process.cwd(), ".paraflux/cache/main.js");
    const mod: any = await import(appRootPath);
    this.App = mod.default ?? mod.App;
    this.root = createRoot(this.App);
    this.root.render();
  }

  public async updateRoot(buildPath: string = ".paraflux/cache/App.js") {
    try {
      if (this.root === null) throw new Error("Root is Null");
      const outPath = convertPathForCacheFn(buildPath);
      // const appRootPath = path.resolve(process.cwd(), ".paraflux/cache/App.js");

      // console.log("outPath: ",outPath);
      // console.log("AppRootPath: ",appRootPath);

      const mod: any = await import(outPath);

      await this.replaceNodeDFS(
        this.root,
        mod.default.constructor.name,
        mod.default
      );

      // Execute full tree code naively
      if (this.root) await this.runTreeInProcess(this.root);
    } catch (error) {
      console.log("Error Updating App: ", error);
    }
  }

  private async replaceNodeDFS(
    root: Node | SuperNode,
    targetName: string,
    NewCtor: new () => Node | SuperNode
  ) {
    try {
      if (root.constructor.name === targetName) {
        if (!root.parent) {
          const newNode = new NewCtor();
          newNode.parent = null;
          this.root = newNode;
        } else {
          const parent = root.parent;
          const newNode = new NewCtor();
          newNode.parent = parent;

          parent.children.set(targetName, newNode);
          newNode.render();
        }
        return;
      }

      // DFS into children
      if (root.children && root.children.size > 0) {
        for (const [, child] of root.children) {
          this.replaceNodeDFS(child, targetName, NewCtor);
        }
      }
    } catch (error) {
      console.log("Error Updating ChildNode: ", error);
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
