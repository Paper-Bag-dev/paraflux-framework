import path from "path";
import { Node, SuperNode } from "@paraflux/core";
import { createRoot } from "@paraflux/core/dist/functions/createRoot";
import { NodeStore } from "./nodeStore";
import { ViewStore } from "./viewsStore";
import convertPathForCacheFn from "../utils/convertPathForCacheFn";
import LiveNOM from "../NOM/LiveNom";
import { Worker } from "node:worker_threads";

class GlobalStore {
  private static instance: GlobalStore | null = null;
  root: SuperNode | Node | null = null;
  private App: any;
  private ignoreFirstError: boolean = true;
  public viewStore: ViewStore = new ViewStore();
  public nodesStore: NodeStore = new NodeStore();
  public liveNom: LiveNOM = new LiveNOM();
  private execWorker: Worker | null = null;

  private constructor() {}

  private runTreeInWorker(root: Node | SuperNode) {
    // Kill old worker if exists
    if (this.execWorker) {
      this.execWorker.terminate();
      this.execWorker = null;
    }

    // Spawn new worker thread
    this.execWorker = new Worker(
      `
    const { parentPort, workerData } = require('node:worker_threads');
    const { execTreeNaive } = require('@paraflux/core');

    (async () => {
      try {
        await execTreeNaive(workerData.root);
      } catch (err) {
        // Only send errors to main thread
        parentPort.postMessage({ status: "error", error: err.toString() });
      }
    })();
    `,
      {
        eval: true,
        workerData: { root },
        stdout: true,
        stderr: true,
      }
    );

    // Pipe worker stdout -> main console
    this.execWorker.stdout?.on("data", (chunk) => {
      process.stdout.write(chunk.toString());
    });

    this.execWorker.stderr?.on("data", (chunk) => {
      process.stderr.write(chunk.toString());
    });

    // Only log errors explicitly posted by worker
    this.execWorker.on("message", (msg) => {
      if (msg.status === "error") {
        console.error("Worker execution error:", msg.error);
      }
    });

    this.execWorker.on("error", (err) => {
      console.error("Worker thread error:", err);
      this.execWorker = null;
    });

    this.execWorker.on("exit", (code) => {
      if (code !== 0) console.error("Worker exited with non-zero code", code);
      this.execWorker = null;
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
      if (this.root) await this.runTreeInWorker(this.root);
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
