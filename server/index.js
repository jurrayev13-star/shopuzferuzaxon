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
const APP_DIR = path.resolve(__dirname, "..", "app");
const LEGACY_DIR = path.resolve(__dirname, "..", "design_handoff_shopuz");

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "shopuzferuzaxon", ts: Date.now() });
});

app.get("/api/_debug/paths", async (_req, res) => {
  try {
    const { readdirSync, statSync } = await import("node:fs");
    function safeList(dir) {
      try {
        return readdirSync(dir).slice(0, 40).map((n) => {
          try {
            const st = statSync(path.join(dir, n));
            return { name: n, dir: st.isDirectory(), size: st.size };
          } catch { return { name: n, err: 1 }; }
        });
      } catch (e) { return { error: e.message }; }
    }
    res.json({
      cwd: process.cwd(),
      __dirname,
      APP_DIR,
      LEGACY_DIR,
      appExists: safeList(APP_DIR),
      legacyExists: safeList(LEGACY_DIR),
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.use("/api/products", productsRouter);
app.use("/api/auth", authRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/admin", adminRouter);

const staticOpts = {
  extensions: ["html"],
  setHeaders(res, filePath) {
    if (/\.(?:jpg|jpeg|png|webp|gif|svg|woff2?)$/i.test(filePath)) {
      res.setHeader("Cache-Control", "public, max-age=604800, immutable");
    } else {
      res.setHeader("Cache-Control", "no-cache");
    }
  },
};

// Yangi mobile-first app root'da
app.use(express.static(APP_DIR, staticOpts));
// Assets — ikkalasi ham bir xil rasm papkasidan foydalanadi
app.use("/assets", express.static(path.join(LEGACY_DIR, "assets"), staticOpts));
// Eski dizayn prototipini /legacy/ ostida saqlab qolamiz
app.use("/legacy", express.static(LEGACY_DIR, staticOpts));

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
