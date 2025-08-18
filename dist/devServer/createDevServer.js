"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDevServer = createDevServer;
const connect_1 = __importDefault(require("connect"));
const http_1 = __importDefault(require("http"));
const ws_1 = require("ws");
function createDevServer(port) {
    const app = (0, connect_1.default)();
    app.use("/", (_req, res) => {
        res.end("Hello From Paraflux Dev Server!");
    });
    const server = http_1.default.createServer(app);
    const wss = new ws_1.WebSocketServer({ server });
    wss.on("connection", (ws) => {
        console.log("⚡ Client Connected!");
        ws.send(JSON.stringify({ type: "connected" }));
    });
    server.listen(5000, () => {
        console.log("🚀 Dev server running at http://localhost:5000");
    });
    return { server, wss };
}
