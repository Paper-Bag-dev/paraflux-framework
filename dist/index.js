#!/usr/bin/env node
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
exports.globalStore = void 0;
const esbuild_1 = __importDefault(require("esbuild"));
const createDevServer_1 = require("./devServer/createDevServer");
const debouncer_1 = __importDefault(require("./utils/debouncer"));
const Watcher_1 = require("./watcher/Watcher");
const node_path_1 = __importDefault(require("node:path"));
async function buildApp() {
    try {
        await esbuild_1.default.build({
            entryPoints: [node_path_1.default.resolve(process.cwd(), "src/App.ts")],
            outfile: node_path_1.default.resolve(process.cwd(), ".paraflux/cache/App.js"),
            bundle: false,
            platform: "node",
            format: "cjs",
            sourcemap: true,
        });
        console.log("✅ Built App.ts → .paraflux/cache/App.js");
    }
    catch (err) {
        console.error("❌ Build failed:", err);
    }
}
async function main() {
    await buildApp();
    const { wss } = (0, createDevServer_1.createDevServer)(5000);
    const globalStore = (await Promise.resolve().then(() => __importStar(require("./store/Store")))).default;
    const debouncedUpdate = (0, debouncer_1.default)(async (event, file) => {
        globalStore.updateRoot();
        console.log("Rebuilt Root!");
        wss.clients.forEach((client) => {
            if (client.readyState === 1) {
                client.send(JSON.stringify({ type: "nom-updated", event, file }));
            }
        });
    }, 300);
    (0, Watcher_1.createWatcher)(async ({ event, file }) => {
        console.log(`Detected File/Folder Changes ${event}: ${file}`);
        // Changes Detected Rebuild the tree and log after debouncing to test!
        await buildApp();
        debouncedUpdate(event, file);
    });
}
main();
var Store_1 = require("./store/Store");
Object.defineProperty(exports, "globalStore", { enumerable: true, get: function () { return __importDefault(Store_1).default; } });
