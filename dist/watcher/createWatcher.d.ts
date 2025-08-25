import { Server, WebSocket } from "ws";
import type Store from "../store/Store";
import { IncomingMessage } from "connect";
export type FileEvent = {
    event: string;
    file: string;
};
export declare function createWatcher(wss: Server<typeof WebSocket, typeof IncomingMessage>, globalStore: typeof Store): Promise<import("chokidar").FSWatcher>;
