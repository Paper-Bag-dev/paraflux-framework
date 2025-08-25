"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createDevServer_1 = require("../../devServer/createDevServer");
const debouncer_1 = __importDefault(require("../../utils/debouncer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const unlinkDirHandler = (0, debouncer_1.default)(async (event, file, globalStore, wss) => {
    try {
        console.log("● Compiling Code (unlinkDir)");
        const cacheDir = path_1.default.resolve(process.cwd(), ".paraflux/cache", path_1.default.relative("src", file));
        await promises_1.default.rm(cacheDir, { recursive: true, force: true });
        globalStore.updateRoot();
        console.log("✔ Compiled Code (unlinkDir)");
        (0, createDevServer_1.broadcast)(wss, { type: "nom-updated", event, file });
    }
    catch (err) {
        console.error("Runtime reload failed at UnlinkDir:", err);
    }
}, 300);
exports.default = unlinkDirHandler;
