import { broadcast } from "../../devServer/createDevServer";
import debounce from "../../utils/debouncer";
import path from "path";
import fs from "fs/promises";

const unlinkDirHandler = debounce(async (event, file, globalStore, wss) => {
  try {
    console.log("● Compiling Code (unlinkDir)");
    const cacheDir = path.resolve(
      process.cwd(),
      ".paraflux/cache",
      path.relative("src", file)
    );
    
    await fs.rm(cacheDir, { recursive: true, force: true });
    console.log("✔ Compiled Code (unlinkDir)");
    broadcast(wss, { type: "nom-updated", event, file });
  } catch (err) {
    console.error("Runtime reload failed at UnlinkDir:", err);
  }
}, 300);

export default unlinkDirHandler;
