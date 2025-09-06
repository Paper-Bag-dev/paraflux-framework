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
const createDevServer_1 = require("./devServer/createDevServer");
const createWatcher_1 = require("./watcher/createWatcher");
const esbuild_1 = __importDefault(require("./builder/esbuild"));
async function main() {
    try {
        await (0, esbuild_1.default)("src/main.ts");
        await (0, esbuild_1.default)("src/App.ts");
        const { wss } = (0, createDevServer_1.createDevServer)(5000);
        const globalStore = (await Promise.resolve().then(() => __importStar(require("./store/Store")))).default;
        await (0, createWatcher_1.createWatcher)(wss, globalStore);
        globalStore.loadAppRoot();
    }
    catch (error) {
        console.log(error);
    }
}
main();
var Store_1 = require("./store/Store");
Object.defineProperty(exports, "globalStore", { enumerable: true, get: function () { return __importDefault(Store_1).default; } });
