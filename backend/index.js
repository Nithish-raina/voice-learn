import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import cors from "cors";
const app = express();

const currentDir = path.dirname(new URL(import.meta.url).pathname);

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
