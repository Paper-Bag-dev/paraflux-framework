export type FileEvent = {
    event: string;
    file: string;
};
export declare function createWatcher(onChange: (evt: FileEvent) => void): import("chokidar").FSWatcher;
