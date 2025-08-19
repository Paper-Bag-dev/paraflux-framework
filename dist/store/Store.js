"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const createRoot_1 = require("@paraflux/core/dist/functions/createRoot");
const nodeStore_1 = require("./nodeStore");
const viewsStore_1 = require("./viewsStore");
class GlobalStore {
    static instance = null;
    root;
    viewStore = new viewsStore_1.ViewStore();
    nodesStore = new nodeStore_1.NodeStore();
    constructor() {
        this.root = this.loadApp();
    }
    loadApp() {
        const appDir = path_1.default.resolve(process.cwd(), ".paraflux/cache/App.js");
        delete require.cache[require.resolve(appDir)];
        const mod = require(appDir);
        const App = mod.default ?? mod.App;
        return (0, createRoot_1.createRoot)(App);
    }
    static getInstance() {
        if (!GlobalStore.instance) {
            GlobalStore.instance = new GlobalStore();
        }
        return GlobalStore.instance;
    }
    updateRoot() {
        this.root = this.loadApp();
    }
}
const globalStore = GlobalStore.getInstance();
exports.default = globalStore;
