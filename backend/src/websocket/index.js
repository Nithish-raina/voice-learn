import { WebSocketServer } from "ws";
import { verifyAccessToken } from "../utils/jwt.js";
import { sessionHandler } from "./session-handler.js";
import { prisma } from "../lib/prisma-client.js";

export function setupWebSocket(server) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle upgrade manually — this avoids path matching issues
  server.on("upgrade", (req, socket, head) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on("connection", async (ws, req) => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const sessionId = url.searchParams.get("sessionId");
      const token = url.searchParams.get("token");

      if (!sessionId || !token) {
        ws.close(4001, "Missing sessionId or token");
        return;
      }

      let userId;
      try {
        const decoded = verifyAccessToken(token);
        userId = decoded.userId;
      } catch (error) {
        ws.close(4002, "Invalid token");
        return;
      }

      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        ws.close(4003, "Session not found");
        return;
      }

      if (session.userId !== userId) {
        ws.close(4004, "Unauthorized");
        return;
      }

      if (session.status !== "recording") {
        ws.close(4005, "Session is not in recording state");
        return;
      }

      console.log(`WebSocket connected: session=${sessionId} user=${userId}`);
      sessionHandler(ws, { sessionId, userId, session });
    } catch (error) {
      console.error("WebSocket connection error:", error);
      ws.close(4000, "Connection failed");
    }
  });

  console.log("WebSocket server ready");
  return wss;
}
