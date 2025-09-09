"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const node_fs_1 = __importDefault(require("node:fs"));
const createExecEnv = async () => {
    const runnerFile = path_1.default.join(process.cwd(), ".paraflux/runner/runnerEnv.mjs");
    node_fs_1.default.mkdirSync(path_1.default.dirname(runnerFile), { recursive: true });
    node_fs_1.default.writeFileSync(runnerFile, `
    import { execTreeNaive } from "@paraflux/core";

    process.on("message", async (root) => {
      try {
        await execTreeNaive(root);
      } catch (e) {
        console.error("Tree execution error:", e);
        process.exit(1);
      }
    });
  `);
};
exports.default = createExecEnv;
