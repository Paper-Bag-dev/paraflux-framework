"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWatcher = createWatcher;
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
function createWatcher(onChange) {
    const watchPath = path_1.default.resolve(process.cwd(), "src");
    const watcher = chokidar_1.default.watch(watchPath, { ignoreInitial: true });
    watcher.on("all", (event, file) => {
        const base = path_1.default.basename(file);
        if (/^[A-Z]/.test(base)) {
            onChange({ event, file });
        }
    });
    return watcher;
}
