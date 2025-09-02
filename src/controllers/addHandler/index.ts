import buildApp from "../../builder/esbuild";
import { broadcast } from "../../devServer/createDevServer";
import debounce from "../../utils/debouncer";

const addHandler = debounce(async (event, file, globalStore, wss) => {
    try {
      console.log("● Compiling Code (build)");
      await buildApp(file);
      // globalStore.updateRoot(file);
      console.log("✔ Compiled Code (build)");
      broadcast(wss, { type: "nom-updated", event, file });
    } catch (err) {
      console.error("Runtime reload failed:", err);
    }
  }, 300);

export default addHandler;