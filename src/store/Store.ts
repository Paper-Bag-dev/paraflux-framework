import path from "path";
import { Node, SuperNode } from "@paraflux/core";
import { createRoot } from "@paraflux/core/dist/functions/createRoot";
import { NodeStore } from "./nodeStore";
import { ViewStore } from "./viewsStore";
import convertPathForCacheFn from "../utils/convertPathForCacheFn";
import LiveNOM from "../NOM/LiveNom";
import { spawn, ChildProcess, fork } from "node:child_process";
class GlobalStore {
  private static instance: GlobalStore | null = null;
  root: SuperNode | Node | null = null;
  private App: any;
  public viewStore: ViewStore = new ViewStore();
  public nodesStore: NodeStore = new NodeStore();
  public liveNom: LiveNOM = new LiveNOM();
  private execProcess: ChildProcess | null = null;

  private constructor() {}

  private runTreeInProcess(root: Node | SuperNode) {
    if (this.execProcess) {
      this.execProcess.kill("SIGTERM");
      this.execProcess = null;
    }

    const runnerFile = path.resolve(
      process.cwd(),
      ".paraflux/runner/runnerEnv.mjs"
    );

    // Fork child process (gives IPC channel)
    this.execProcess = fork(runnerFile, {
      stdio: ["inherit", "inherit", "inherit", "ipc"],
    });

    // Send the in-memory root object
    this.execProcess.send(root);

    this.execProcess.on("exit", (code) => {
      if (code !== 0) console.error("Tree process exited with code", code);
      this.execProcess = null;
    });

    this.execProcess.on("error", (err) => {
      console.error("Tree process error:", err);
      this.execProcess = null;
    });

    console.log("✔ Running build in child process");
  }

  public async loadAppRoot() {
    const appRootPath = path.resolve(process.cwd(), ".paraflux/cache/main.js");

    const mod: any = await import(appRootPath);
    this.App = mod.default ?? mod.App;
    this.root = createRoot(this.App);
    this.root.render();
  }

  public async updateRoot(buildPath: string = ".paraflux/cache/main.js") {
    try {
      if (this.root === null) throw new Error("Root is Null");
      const outPath = convertPathForCacheFn(buildPath);

      const mod: any = await import(outPath);

      await this.replaceNodeDFS(this.root, mod.default.name, mod.default);

      if (this.root) this.runTreeInProcess(this.root);
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
          parent.render();
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
