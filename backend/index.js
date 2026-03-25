import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./src/routes/index.js";
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import { errorHandler } from "./src/middlewares/error-handler.js";
import { requestLogger } from "./src/middlewares/request-logger.js";
import { setupWebSocket } from "./src/websocket/index.js";
import logger from "./src/lib/logger.js";

const app = express();

const currentDir = path.dirname(new URL(import.meta.url).pathname);

app.use(
  cors({
    origin: function (origin, callback) {
      const allowed = [
        process.env.CLIENT_URL,
        "http://localhost:5173",
        "http://localhost:3000",
      ].filter(Boolean);

      // Allow requests with no origin (mobile apps, Postman, server-to-server)
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

if (process.env.NODE_ENV !== "production") {
  const swaggerDocument = YAML.load(
    path.join(currentDir, "../docs/swagger.yaml"),
  );
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, {
      customSiteTitle: "VoiceLearn API Docs",
      customCss: ".swagger-ui .topbar { display: none }",
    }),
  );
}

app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "success",
    data: { message: "VoiceLearn API is running" },
  });
});

// All routes
app.use("/api/v1", routes);

// Global error handler — must be after routes
app.use(errorHandler);

// Create HTTP server and attach WebSocket
const server = createServer(app);
setupWebSocket(server);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info({ port: PORT }, "Server running");
  logger.info({ port: PORT }, "WebSocket available");
});
