"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const esbuild_1 = __importDefault(require("../../builder/esbuild"));
const createDevServer_1 = require("../../devServer/createDevServer");
const debouncer_1 = __importDefault(require("../../utils/debouncer"));
const queueAddUpdate = (0, debouncer_1.default)(async (event, file, globalStore, wss) => {
    try {
        await (0, esbuild_1.default)(file);
        globalStore.updateRoot();
        console.log("✔ Compiled Code");
        (0, createDevServer_1.broadcast)(wss, { type: "nom-updated", event, file });
    }
    catch (err) {
        console.error("Runtime reload failed:", err);
    }
}, 300);
exports.default = queueAddUpdate;
