import esbuild from "esbuild";
import path from "path";
import fs from "fs";
import convertPathForCacheFn from "../utils/convertPathForCacheFn";

async function buildApp(buildPath: string) {
  try {
    if (!buildPath) buildPath = "src/App.ts";

    const absPath = path.resolve(process.cwd(), buildPath);

    const outFile = convertPathForCacheFn(buildPath);

    // Ensure cache dir exists
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    await esbuild.build({
      entryPoints: [absPath],
      outfile: outFile,
      bundle: false,
      platform: "node",
      format: "cjs",
      sourcemap: true,
      write: true
    });

    return true;
  } catch (err) {
    console.error("✗ Build failed:", err);
    return false;
  }
}

export default buildApp;
