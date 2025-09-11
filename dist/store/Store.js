"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const createRoot_1 = require("@paraflux/core/dist/functions/createRoot");
const nodeStore_1 = require("./nodeStore");
const viewsStore_1 = require("./viewsStore");
const convertPathForCacheFn_1 = __importDefault(require("../utils/convertPathForCacheFn"));
const LiveNom_1 = __importDefault(require("../NOM/LiveNom"));
const node_worker_threads_1 = require("node:worker_threads");
const fs_1 = __importDefault(require("fs"));
class GlobalStore {
    static instance = null;
    root = null;
    App;
    viewStore = new viewsStore_1.ViewStore();
    nodesStore = new nodeStore_1.NodeStore();
    liveNom = new LiveNom_1.default();
    execWorker = null;
    constructor() { }
    ensureWorkerFile() {
        const runnerDir = path_1.default.resolve(process.cwd(), ".paraflux/runner");
        const runnerFile = path_1.default.join(runnerDir, "workerExec.js");
        fs_1.default.mkdirSync(runnerDir, { recursive: true });
        // write minimal worker file only if missing (keeps dev fast)
        if (!fs_1.default.existsSync(runnerFile)) {
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
            fs_1.default.writeFileSync(runnerFile, workerSource, { encoding: "utf8" });
        }
        return runnerFile;
    }
    runTreeInProcess(buildPathOrRoot) {
        if (this.execWorker) {
            this.execWorker.terminate();
            this.execWorker = null;
        }
        // ensure runner file exists and get its path
        const runnerFile = this.ensureWorkerFile();
        // Resolve buildPath into a filesystem path the worker can require
        // If caller passed a string, use that; else fall back to default compiled path
        let buildPath;
        if (typeof buildPathOrRoot === "string") {
            buildPath = buildPathOrRoot;
        }
        else {
            // fallback: you may want to throw here and force caller to pass build path
            throw new Error("runTreeInProcess: please pass compiled build path (string), not root instance");
        }
        // If buildPath is a file:// URL, convert to file path
        if (buildPath.startsWith("file://")) {
            const { fileURLToPath } = require("node:url");
            buildPath = fileURLToPath(buildPath);
        }
        else if (!path_1.default.isAbsolute(buildPath)) {
            // make absolute relative to cwd
            buildPath = path_1.default.resolve(process.cwd(), buildPath);
        }
        // spawn worker and pass the buildPath via workerData
        this.execWorker = new node_worker_threads_1.Worker(runnerFile, {
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
            if (code !== 0)
                console.error("Worker exited with code", code);
            this.execWorker = null;
        });
        console.log("✔ Running build in worker");
    }
    async loadAppRoot() {
        const appRootPath = path_1.default.resolve(process.cwd(), ".paraflux/cache/main.js");
        const mod = await Promise.resolve(`${appRootPath}`).then(s => __importStar(require(s)));
        this.App = mod.default ?? mod.App;
        this.root = (0, createRoot_1.createRoot)(this.App);
        this.root.render();
    }
    async updateRoot(buildPath = ".paraflux/cache/main.js") {
        try {
            if (this.root === null)
                throw new Error("Root is Null");
            const outPath = (0, convertPathForCacheFn_1.default)(buildPath);
            const rootPath = (0, convertPathForCacheFn_1.default)(".paraflux/cache/App.js");
            const mod = await Promise.resolve(`${outPath}`).then(s => __importStar(require(s)));
            await this.replaceNodeDFS(this.root, mod.default.name, mod.default);
            // Now run in worker by giving worker the path to the compiled file
            // Convert to a filesystem path the worker can require:
            let requirePath = outPath;
            if (requirePath.startsWith("file://")) {
                const { fileURLToPath } = require("node:url");
                requirePath = fileURLToPath(requirePath);
            }
            else {
                requirePath = path_1.default.resolve(process.cwd(), requirePath);
            }
            this.runTreeInProcess(requirePath);
        }
        catch (error) {
            console.log("Error Updating App: ", error);
        }
    }
    async replaceNodeDFS(root, targetName, NewCtor) {
        try {
            if (root.constructor.name === targetName) {
                if (!root.parent) {
                    const newNode = new NewCtor();
                    newNode.parent = null;
                    this.root = newNode;
                }
                else {
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
        }
        catch (error) {
            console.log("Error Updating ChildNode: ", error);
        }
    }
    static getInstance() {
        if (!GlobalStore.instance) {
            GlobalStore.instance = new GlobalStore();
        }
        return GlobalStore.instance;
    }
}
const globalStore = GlobalStore.getInstance();
exports.default = globalStore;
