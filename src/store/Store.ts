import path from "path";
import { Node, SuperNode } from "@paraflux/core";
import { createRoot } from "@paraflux/core/dist/functions/createRoot";
import { NodeStore } from "./nodeStore";
import { ViewStore } from "./viewsStore";
import convertPathForCacheFn from "../utils/convertPathForCacheFn";
import LiveNOM from "../NOM/LiveNom";
import { Worker } from "node:worker_threads";
import fs from "fs";
class GlobalStore {
  private static instance: GlobalStore | null = null;
  root: SuperNode | Node | null = null;
  private App: any;
  public viewStore: ViewStore = new ViewStore();
  public nodesStore: NodeStore = new NodeStore();
  public liveNom: LiveNOM = new LiveNOM();
  private execWorker: Worker | null = null;

  private constructor() {}

  private ensureWorkerFile(): string {
    const runnerDir = path.resolve(process.cwd(), ".paraflux/runner");
    const runnerFile = path.join(runnerDir, "workerExec.js");

    fs.mkdirSync(runnerDir, { recursive: true });

    // write minimal worker file only if missing (keeps dev fast)
    if (!fs.existsSync(runnerFile)) {
      const workerSource = `// (auto-generated) workerExec
const { parentPort, workerData } = require("node:worker_threads");
const path = require("path");
const origLog = console.log;
console.log = (...args) => { try { parentPort.postMessage({ _workerLog: true, args }); } catch(e){} origLog(...args); };

(async () => {
  try {
    const buildPath = workerData && workerData.buildPath;
    if (!buildPath) throw new Error("No buildPath provided");
    const mod = require(buildPath);
    const App = mod.default ?? mod.App ?? mod;
    const core = require("@paraflux/core");
    const execTreeNaive = core.execTreeNaive ?? core.execTreeNaive;
    const createRoot = core.createRoot ?? require("@paraflux/core/dist/functions/createRoot").createRoot;
    if (typeof createRoot !== "function") throw new Error("createRoot not found");
    const root = createRoot(App);
    root.render();
    await execTreeNaive(root);
    parentPort.postMessage({ done: true });
  } catch (err) {
    parentPort.postMessage({ error: err && err.stack ? err.stack : String(err) });
  }
})();
`;
      fs.writeFileSync(runnerFile, workerSource, { encoding: "utf8" });
    }

    return runnerFile;
  }

  private runTreeInProcess(buildPathOrRoot: string | Node | SuperNode) {
    if (this.execWorker) {
      this.execWorker.terminate();
      this.execWorker = null;
    }

    // ensure runner file exists and get its path
    const runnerFile = this.ensureWorkerFile();

    // Resolve buildPath into a filesystem path the worker can require
    // If caller passed a string, use that; else fall back to default compiled path
    let buildPath: string;
    if (typeof buildPathOrRoot === "string") {
      buildPath = buildPathOrRoot;
    } else {
      // fallback: you may want to throw here and force caller to pass build path
      throw new Error(
        "runTreeInProcess: please pass compiled build path (string), not root instance"
      );
    }

    // If buildPath is a file:// URL, convert to file path
    if (buildPath.startsWith("file://")) {
      const { fileURLToPath } = require("node:url");
      buildPath = fileURLToPath(buildPath);
    } else if (!path.isAbsolute(buildPath)) {
      // make absolute relative to cwd
      buildPath = path.resolve(process.cwd(), buildPath);
    }

    // spawn worker and pass the buildPath via workerData
    this.execWorker = new Worker(runnerFile, {
      workerData: { buildPath },
    });

    // this.execWorker.on("message", (msg) => {
    //   if (msg && msg._workerLog) {
    //     console.log("[Worker]", ...msg.args);
    //   } else if (msg && msg.done) {
    //     console.log("[Worker] done");
    //   } else if (msg && msg.error) {
    //     console.error("[Worker error]", msg.error);
    //   } else {
    //     console.log("[Worker message]", msg);
    //   }
    // });

    this.execWorker.on("error", (err) => {
      console.error("Worker error:", err);
    });

    this.execWorker.on("exit", (code) => {
      if (code !== 0) console.error("Worker exited with code", code);
      this.execWorker = null;
    });

    console.log("✔ Running build in worker");
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
      const rootPath = convertPathForCacheFn( ".paraflux/cache/App.js");
      const mod: any = await import(outPath);
      await this.replaceNodeDFS(this.root, mod.default.name, mod.default);

      // Now run in worker by giving worker the path to the compiled file
      // Convert to a filesystem path the worker can require:
      let requirePath = outPath;
      if (requirePath.startsWith("file://")) {
        const { fileURLToPath } = require("node:url");
        requirePath = fileURLToPath(requirePath);
      } else {
        requirePath = path.resolve(process.cwd(), requirePath);
      }

      this.runTreeInProcess(requirePath);
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
