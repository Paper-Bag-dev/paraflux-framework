import http from "http";
export declare function createDevServer(port: number): {
    server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>;
    wss: import("ws").Server<typeof import("ws"), typeof http.IncomingMessage>;
};
