import chokidar from "chokidar";
import path from "path";

export type FileEvent = {
    event: string,
    file: string
}

export function createWatcher(onChange: (evt: FileEvent) => void){
    const watchPath = path.resolve(process.cwd(), "src");
    const watcher = chokidar.watch(watchPath, {ignoreInitial: true});

    watcher.on("all", (event, file) => {
        const base = path.basename(file);

        if(/^[A-Z]/.test(base)){
            onChange({event, file});
        }
    })

    return watcher;
}