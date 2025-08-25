import esbuild from "esbuild";
import path from "path";
import fs from "fs";

async function buildApp(buildPath: string) {
  try {
    if (!buildPath) buildPath = "src/App.ts";

    const absPath = path.resolve(process.cwd(), buildPath);

    const relativePath = path.relative(
      path.resolve(process.cwd(), "src"),
      absPath
    );

    const outPath = relativePath.replace(path.extname(relativePath), ".js");
    const outFile = path.resolve(process.cwd(), `.paraflux/cache/${outPath}`);

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
