import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { initDb } from "./db.js";
import productsRouter from "./routes/products.js";
import authRouter from "./routes/auth.js";
import ordersRouter from "./routes/orders.js";
import adminRouter from "./routes/admin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, "..", "design_handoff_shopuz");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "shopuzferuzaxon", ts: Date.now() });
});

app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);

app.use(
  express.static(PUBLIC_DIR, {
    extensions: ["html"],
    setHeaders(res, filePath) {
      if (/\.(?:jpg|jpeg|png|webp|gif|svg|woff2?)$/i.test(filePath)) {
        res.setHeader("Cache-Control", "public, max-age=604800, immutable");
      } else {
        res.setHeader("Cache-Control", "no-cache");
      }
    },
  })
);

app.get("/", (_req, res) => res.redirect(302, "/Home.dc.html"));

app.use((_req, res) => res.status(404).send("Sahifa topilmadi"));

app.use((err, _req, res, _next) => {
  console.error("[server error]", err);
  res.status(500).json({ error: "server_error", message: err.message });
});

const PORT = Number(process.env.PORT) || 8080;

initDb()
  .catch((e) => {
    console.warn("[db] init warning:", e.message);
  })
  .finally(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Shop Uz Feruzaxon http://localhost:${PORT}`);
    });
  });
