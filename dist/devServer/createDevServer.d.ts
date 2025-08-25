import http from "http";
import { WebSocketServer } from "ws";
export declare function createDevServer(port: number): {
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    wss: import("ws").Server<typeof import("ws"), typeof http.IncomingMessage>;
};
export declare function broadcast(wss: WebSocketServer, msg: object): void;
