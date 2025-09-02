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
const core_1 = require("@paraflux/core");
const convertPathForCacheFn_1 = __importDefault(require("../utils/convertPathForCacheFn"));
const LiveNom_1 = __importDefault(require("../NOM/LiveNom"));
class GlobalStore {
    static instance = null;
    root = null;
    App;
    viewStore = new viewsStore_1.ViewStore();
    nodesStore = new nodeStore_1.NodeStore();
    liveNom = new LiveNom_1.default();
    constructor() { }
    // Recursive cache clearing
    clearModuleCache(modulePath) {
        const resolvedPath = require.resolve(modulePath);
        const mod = require.cache[resolvedPath];
        if (!mod)
            return;
        if (resolvedPath.includes("node_modules"))
            return;
        try {
            delete require.cache[resolvedPath];
        }
        catch (error) {
            return;
        }
        for (const m of Object.values(require.cache)) {
            if (!m)
                continue;
            if (m.children.some((c) => c.id === resolvedPath)) {
                this.clearModuleCache(m.id);
            }
        }
    }
    async loadAppRoot() {
        const appRootPath = path_1.default.resolve(process.cwd(), ".paraflux/cache/App.js");
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
            console.log("Updating Root, ", outPath);
            const appRootPath = path_1.default.resolve(process.cwd(), ".paraflux/cache/App.js");
            this.clearModuleCache(outPath);
            const mod = await Promise.resolve(`${appRootPath}`).then(s => __importStar(require(s)));
            this.App = mod.default ?? mod.App;
            this.root.render();
            // Execute full tree code naively
            if (this.root)
                await (0, core_1.execTreeNaive)(this.root);
        }
        catch (error) {
            console.log("Error Updating App: ", error);
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
