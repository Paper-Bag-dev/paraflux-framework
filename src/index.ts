#!/usr/bin/env node
import { createDevServer } from "./devServer/createDevServer";
import { createWatcher } from "./watcher/createWatcher";
import buildApp from "./builder/esbuild";

async function main() {
  try {
    await buildApp("src/main.ts");
    await buildApp("src/App.ts");
    const { wss } = createDevServer(5000);
    const globalStore = (await import("./store/Store")).default;
    await createWatcher(wss, globalStore);
    globalStore.loadAppRoot();
  } catch (error) {
    console.log(error);
  }
}

main();

export { default as globalStore } from "./store/Store";
