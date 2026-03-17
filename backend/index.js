import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./src/routes/index.js";
import { errorHandler } from "./src/middlewares/error-handler.js";
import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";

const app = express();

const currentDir = path.dirname(new URL(import.meta.url).pathname);

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
