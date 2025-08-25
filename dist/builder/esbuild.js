"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const esbuild_1 = __importDefault(require("esbuild"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
async function buildApp(buildPath) {
    try {
        if (!buildPath)
            buildPath = "src/App.ts";
        const absPath = path_1.default.resolve(process.cwd(), buildPath);
        const relativePath = path_1.default.relative(path_1.default.resolve(process.cwd(), "src"), absPath);
        const outPath = relativePath.replace(path_1.default.extname(relativePath), ".js");
        const outFile = path_1.default.resolve(process.cwd(), `.paraflux/cache/${outPath}`);
        // Ensure cache dir exists
        fs_1.default.mkdirSync(path_1.default.dirname(outFile), { recursive: true });
        await esbuild_1.default.build({
            entryPoints: [absPath],
            outfile: outFile,
            bundle: false,
            platform: "node",
            format: "cjs",
            sourcemap: true,
            write: true
        });
        return true;
    }
    catch (err) {
        console.error("✗ Build failed:", err);
        return false;
    }
}
exports.default = buildApp;
