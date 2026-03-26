import { WebSocketServer } from "ws";
import { verifyAccessToken } from "../utils/jwt.js";
import { sessionHandler } from "./session-handler.js";
import { prisma } from "../lib/prisma-client.js";
import logger from "../lib/logger.js";

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

      let session;
      try {
        session = await prisma.session.findUnique({
          where: { id: sessionId },
        });
      } catch (error) {
        logger.error({ err: error, sessionId }, "WS database error looking up session");
        ws.close(4000, "Unable to verify session. Please try again.");
        return;
      }

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

      logger.info({ sessionId, userId }, "WS connected");
      sessionHandler(ws, { sessionId, userId, session });
    } catch (error) {
      logger.error({ err: error }, "WS connection error");
      ws.close(4000, "Connection failed. Please try again.");
    }
  });

  logger.info("WebSocket server ready");
  return wss;
}
