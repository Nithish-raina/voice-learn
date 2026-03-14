import express from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
const app = express();

const currentDir = path.dirname(new URL(import.meta.url).pathname);
if (process.env.NODE_ENV !== "production") {
  const swaggerDocument = YAML.load(
    path.join(currentDir, "../api-docs/swagger.yaml"),
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
