#!/usr/bin/env node
import esbuild from "esbuild";
import { createDevServer } from "./devServer/createDevServer";
import debounce from "./utils/debouncer";
import { createWatcher } from "./watcher/Watcher";
import path from "node:path";

async function buildApp() {
  try {
    await esbuild.build({
      entryPoints: [path.resolve(process.cwd(), "src/App.ts")],
      outfile: path.resolve(process.cwd(), ".paraflux/cache/App.js"),
      bundle: false,
      platform: "node",
      format: "cjs",
      sourcemap: true,
    });
    console.log("✅ Built App.ts → .paraflux/cache/App.js");
  } catch (err) {
    console.error("❌ Build failed:", err);
  }
}


async function main() {
  await buildApp();
  const { wss } = createDevServer(5000);
  const  globalStore = (await import("./store/Store")).default;
  
  const debouncedUpdate = debounce(async (event, file) => {
    globalStore.updateRoot();

    console.log("Rebuilt Root!");

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: "nom-updated", event, file }));
      }
    });
  }, 300);

  createWatcher( async ({ event, file }) => {
    console.log(`Detected File/Folder Changes ${event}: ${file}`);
    // Changes Detected Rebuild the tree and log after debouncing to test!
    await buildApp();
    debouncedUpdate(event, file);
  });
}

main();

export { default as globalStore } from "./store/Store";
