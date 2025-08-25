import buildApp from "../../builder/esbuild";
import { broadcast } from "../../devServer/createDevServer";
import debounce from "../../utils/debouncer";
import path from "path";
import fs from "fs/promises";

const addDirHandler = debounce(async (event, file, globalStore, wss) => {
  try {
    console.log("● Compiling Code (addDir)");
    const cacheDir = path.resolve(
      process.cwd(),
      ".paraflux/cache",
      path.relative("src", file)
    );

    await fs.mkdir(cacheDir, { recursive: true });

    globalStore.updateRoot();
    console.log("✔ Compiled Code (addDir)");
    broadcast(wss, { type: "nom-updated", event, file });
  } catch (err) {
    console.error("Runtime reload failed at AddDir:", err);
  }
}, 300);

export default addDirHandler;
