import { broadcast } from "../../devServer/createDevServer";
import debounce from "../../utils/debouncer";
import path from "path";
import fs from "fs/promises";

const unlinkHandler = debounce(async (event, file, globalStore, wss) => {
    try {
      console.log("● Compiling Code (unlink)");
      globalStore.updateRoot(file);
      const cachePath = path.resolve(process.cwd(), ".paraflux/cache", path.relative("src", file)).replace(/\.ts$/, ".js");
      const mapCachePath = path.resolve(process.cwd(), ".paraflux/cache", path.relative("src", file)).replace(/\.ts$/, ".js.map");
      await fs.rm(cachePath, { force: true });
      await fs.rm(mapCachePath, { force: true });
      
      console.log("✔ Compiled Code (unlink)");
      broadcast(wss, { type: "nom-updated", event, file });
    } catch (err) {
      console.error("Runtime reload failed at Unlink:", err);
    }
  }, 300);

export default unlinkHandler;