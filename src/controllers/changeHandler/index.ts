import buildApp from "../../builder/esbuild";
import { broadcast } from "../../devServer/createDevServer";
import debounce from "../../utils/debouncer";

const changeHandler = debounce(async (event, file, globalStore, wss) => {
    try {
      console.log("● Compiling code (changes)");
      await buildApp(file);
      globalStore.updateRoot();
      console.log("✔ Compiled code (changes)");
      broadcast(wss, { type: "nom-updated", event, file });
    } catch (err) {
      console.error("Runtime reload failed:", err);
    }
  }, 300);

export default changeHandler;