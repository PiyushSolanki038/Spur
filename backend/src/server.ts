import cors from "cors";
import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./db/client.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { chatRouter } from "./routes/chat.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/chat", chatRouter);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Serve built frontend (Render single-service deploy)
const frontendDist = path.join(__dirname, "../../frontend/dist");
app.use(express.static(frontendDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/chat") || req.path.startsWith("/health")) return next();
  res.sendFile(path.join(frontendDist, "index.html"), (err) => {
    if (err) next();
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Spur chat backend listening on port ${PORT}`);
});
