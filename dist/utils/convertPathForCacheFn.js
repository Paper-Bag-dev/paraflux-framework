"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const path_1 = __importDefault(require("path"));
function default_1(buildPath) {
    const absPath = path_1.default.resolve(process.cwd(), buildPath);
    const relativePath = path_1.default.relative(path_1.default.resolve(process.cwd(), "src"), absPath);
    const outPath = relativePath.replace(path_1.default.extname(relativePath), ".js");
    const outFile = path_1.default.resolve(process.cwd(), `.paraflux/cache/${outPath}`);
    return outFile;
}
