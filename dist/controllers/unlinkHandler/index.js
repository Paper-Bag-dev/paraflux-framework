"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const createDevServer_1 = require("../../devServer/createDevServer");
const debouncer_1 = __importDefault(require("../../utils/debouncer"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const unlinkHandler = (0, debouncer_1.default)(async (event, file, globalStore, wss) => {
    try {
        console.log("● Compiling Code (unlink)");
        const cachePath = path_1.default.resolve(process.cwd(), ".paraflux/cache", path_1.default.relative("src", file)).replace(/\.ts$/, ".js");
        const mapCachePath = path_1.default.resolve(process.cwd(), ".paraflux/cache", path_1.default.relative("src", file)).replace(/\.ts$/, ".js.map");
        await promises_1.default.rm(cachePath, { force: true });
        await promises_1.default.rm(mapCachePath, { force: true });
        globalStore.updateRoot();
        console.log("✔ Compiled Code (unlink)");
        (0, createDevServer_1.broadcast)(wss, { type: "nom-updated", event, file });
    }
    catch (err) {
        console.error("Runtime reload failed at Unlink:", err);
    }
}, 300);
exports.default = unlinkHandler;
