#!/usr/bin/env node
import { createDevServer } from "./devServer/createDevServer";
import globalStore from "./store/Store";
import debounce from "./utils/debouncer";
import { createWatcher } from "./watcher/Watcher";

const { wss } = createDevServer(5000);

const debouncedUpdate = debounce(async (event, file) => {
  await globalStore.updateRoot();
  console.log("Rebuilt Root!");
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({ type: "nom-updated", event, file }));
    }
  });
}, 300);

createWatcher(({ event, file }) => {
  console.log(`Detected File/Folder Changes ${event}: {$file}`);
  // Changes Detected Rebuild the tree and log after debouncing to test!
  debouncedUpdate(event, file);
});

export { default as globalStore } from "./store/Store";
