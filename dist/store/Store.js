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
const createRoot_1 = require("@paraflux/core/dist/functions/createRoot");
const nodeStore_1 = require("./nodeStore");
const viewsStore_1 = require("./viewsStore");
const path_1 = __importDefault(require("path"));
class GlobalStore {
    static instance = null;
    root;
    viewStore = new viewsStore_1.ViewStore();
    nodesStore = new nodeStore_1.NodeStore();
    constructor() {
        const appDir = path_1.default.resolve(process.cwd(), "src/App.ts");
        const mod = require(appDir);
        const App = mod.default ?? mod.App;
        this.root = (0, createRoot_1.createRoot)(App);
    }
    static getInstance() {
        if (!GlobalStore.instance) {
            GlobalStore.instance = new GlobalStore();
        }
        return GlobalStore.instance;
    }
    getRoot() {
        return this.root;
    }
    async updateRoot() {
        const mod = await Promise.resolve(`${"./App?" + Date.now()}`).then(s => __importStar(require(s)));
        const App = mod.default ?? mod.App;
        this.root = (0, createRoot_1.createRoot)(App);
    }
}
const globalStore = GlobalStore.getInstance();
exports.default = globalStore;
