#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalStore = void 0;
const createDevServer_1 = require("./devServer/createDevServer");
const Store_1 = __importDefault(require("./store/Store"));
const debouncer_1 = __importDefault(require("./utils/debouncer"));
const Watcher_1 = require("./watcher/Watcher");
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
(0, Watcher_1.createWatcher)(({ event, file }) => {
    console.log(`Detected File/Folder Changes ${event}: {$file}`);
    // Changes Detected Rebuild the tree and log after debouncing to test!
    debouncedUpdate(event, file);
});
var Store_2 = require("./store/Store");
Object.defineProperty(exports, "globalStore", { enumerable: true, get: function () { return __importDefault(Store_2).default; } });
