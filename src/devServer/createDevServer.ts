import connect from "connect";
import http from "http";
import { WebSocketServer } from "ws";

export function createDevServer(port: number) {
  const app = connect();

  app.use("/", (_req, res) => {
    res.end("Hello From Paraflux Dev Server!");
  });

  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    console.log("⚡ Client Connected!");
    ws.send(JSON.stringify({ type: "connected" }));
  });

  server.listen(5000, () => {
    console.log("🚀 Dev server running at http://localhost:5000");
  });

  return {server, wss};
}
