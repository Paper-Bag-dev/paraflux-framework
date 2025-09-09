import path from "path";
import fs from "node:fs";

const createExecEnv = async () => {
  const runnerFile = path.join(process.cwd(), ".paraflux/runner/runnerEnv.mjs");

  fs.mkdirSync(path.dirname(runnerFile), { recursive: true });

  fs.writeFileSync(
    runnerFile,
    `
    import { execTreeNaive } from "@paraflux/core";

    process.on("message", async (root) => {
      try {
        await execTreeNaive(root);
      } catch (e) {
        console.error("Tree execution error:", e);
        process.exit(1);
      }
    });
  `
  );
};
export default createExecEnv;
