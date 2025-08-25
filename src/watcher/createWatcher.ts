import chokidar from "chokidar";
import path from "path";
import { Server, WebSocket } from "ws";
import type Store from "../store/Store";
import { IncomingMessage } from "connect";
import addHandler from "../controllers/addHandler";
import addDirHandler from "../controllers/addDirHandler";
import unlinkHandler from "../controllers/unlinkHandler";
import changeHandler from "../controllers/changeHandler";
import unlinkDirHandler from "../controllers/unlinkDirHandler";

export type FileEvent = {
  event: string;
  file: string;
};

export async function createWatcher(
  wss: Server<typeof WebSocket, typeof IncomingMessage>,
  globalStore: typeof Store
) {
  const watchPath = path.resolve(process.cwd(), "src");
  const watcher = chokidar.watch(watchPath, {
    ignoreInitial: true,
    ignored: [
      /(^|[\/\\])\../, 
      /\.js[^/\\]+(\.map)?$/,
      /~$/,
      /\.tmp$/,
    ],
  });

  watcher.on("all", (event, file) => {
    const base = path.basename(file);
    const dir = path.basename(path.dirname(file));
    const isCapitalFile = /^[A-Z]/.test(base);
    const isIndexInCapitalFolder = base === "index.ts" && /^[A-Z]/.test(dir);

    if (isCapitalFile || isIndexInCapitalFolder) {
      switch (event) {
        case "add":
          addHandler(event, file, globalStore, wss);
          break;
        case "addDir":
          addDirHandler(event, file, globalStore, wss);
          break;
        case "unlink":
          unlinkHandler(event, file, globalStore, wss);
          break;
        case "unlinkDir":
          unlinkDirHandler(event, file, globalStore, wss);
          break;
        case "change":
          changeHandler(event, file, globalStore, wss);
          break;
        default:
          throw new Error("Unhandled Case Type: ");
      }
    }
  });

  return watcher;
}
