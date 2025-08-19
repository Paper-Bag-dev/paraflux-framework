#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalStore = void 0;
const esbuild_1 = __importDefault(require("esbuild"));
const createDevServer_1 = require("./devServer/createDevServer");
const Store_1 = __importDefault(require("./store/Store"));
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
    const debouncedUpdate = (0, debouncer_1.default)(async (event, file) => {
        await Store_1.default.updateRoot();
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
var Store_2 = require("./store/Store");
Object.defineProperty(exports, "globalStore", { enumerable: true, get: function () { return __importDefault(Store_2).default; } });
