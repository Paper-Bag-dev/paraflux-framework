"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWatcher = createWatcher;
const chokidar_1 = __importDefault(require("chokidar"));
const path_1 = __importDefault(require("path"));
const addHandler_1 = __importDefault(require("../controllers/addHandler"));
const addDirHandler_1 = __importDefault(require("../controllers/addDirHandler"));
const unlinkHandler_1 = __importDefault(require("../controllers/unlinkHandler"));
const changeHandler_1 = __importDefault(require("../controllers/changeHandler"));
const unlinkDirHandler_1 = __importDefault(require("../controllers/unlinkDirHandler"));
async function createWatcher(wss, globalStore) {
    const watchPath = path_1.default.resolve(process.cwd(), "src");
    const watcher = chokidar_1.default.watch(watchPath, {
        ignoreInitial: true,
        ignored: [
            /(^|[\/\\])\../,
            /\.js[^/\\]+(\.map)?$/,
            /~$/,
            /\.tmp$/,
        ],
    });
    watcher.on("all", (event, file) => {
        const base = path_1.default.basename(file);
        const dir = path_1.default.basename(path_1.default.dirname(file));
        const isCapitalFile = /^[A-Z]/.test(base);
        const isIndexInCapitalFolder = base === "index.ts" && /^[A-Z]/.test(dir);
        if (isCapitalFile || isIndexInCapitalFolder) {
            switch (event) {
                case "add":
                    (0, addHandler_1.default)(event, file, globalStore, wss);
                    break;
                case "addDir":
                    (0, addDirHandler_1.default)(event, file, globalStore, wss);
                    break;
                case "unlink":
                    (0, unlinkHandler_1.default)(event, file, globalStore, wss);
                    break;
                case "unlinkDir":
                    (0, unlinkDirHandler_1.default)(event, file, globalStore, wss);
                    break;
                case "change":
                    (0, changeHandler_1.default)(event, file, globalStore, wss);
                    break;
                default:
                    throw new Error("Unhandled Case Type: ");
            }
        }
    });
    return watcher;
}
