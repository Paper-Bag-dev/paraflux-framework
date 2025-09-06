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
const node_child_process_1 = require("node:child_process");
class GlobalStore {
    static instance = null;
    root = null;
    App;
    ignoreFirstError = true;
    viewStore = new viewsStore_1.ViewStore();
    nodesStore = new nodeStore_1.NodeStore();
    liveNom = new LiveNom_1.default();
    execProcess = null;
    constructor() { }
    runTreeInProcess(root) {
        // Kill previous process if exists
        if (this.execProcess) {
            this.execProcess.kill("SIGTERM");
            this.execProcess = null;
        }
        // Create a temporary file that runs the tree
        const tempRunnerPath = require("path").resolve(process.cwd(), ".paraflux/cache/treeRunner.js");
        // Write a small JS file dynamically
        const fs = require("fs");
        fs.writeFileSync(tempRunnerPath, `
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
      `);
        // Spawn a new Node process to run the tree
        this.execProcess = (0, node_child_process_1.spawn)(process.execPath, [tempRunnerPath], {
            stdio: "inherit", // pipes stdout/stderr to main terminal
        });
        this.execProcess.on("exit", (code) => {
            if (code !== 0)
                console.error("Tree process exited with code", code);
            this.execProcess = null;
        });
        this.execProcess.on("error", (err) => {
            console.error("Tree process error:", err);
            this.execProcess = null;
        });
    }
    async loadAppRoot() {
        const appRootPath = path_1.default.resolve(process.cwd(), ".paraflux/cache/main.js");
        const mod = await Promise.resolve(`${appRootPath}`).then(s => __importStar(require(s)));
        this.App = mod.default ?? mod.App;
        this.root = (0, createRoot_1.createRoot)(this.App);
        this.root.render();
    }
    async updateRoot(buildPath = ".paraflux/cache/App.js") {
        try {
            if (this.root === null)
                throw new Error("Root is Null");
            const outPath = (0, convertPathForCacheFn_1.default)(buildPath);
            // const appRootPath = path.resolve(process.cwd(), ".paraflux/cache/App.js");
            // console.log("outPath: ",outPath);
            // console.log("AppRootPath: ",appRootPath);
            const mod = await Promise.resolve(`${outPath}`).then(s => __importStar(require(s)));
            await this.replaceNodeDFS(this.root, mod.default.constructor.name, mod.default);
            // Execute full tree code naively
            if (this.root)
                await this.runTreeInProcess(this.root);
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
