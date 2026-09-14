import { Router } from "express";
import { query, hasDb } from "../db.js";

const router = Router();

const FALLBACK = [
  {
    id: "daffic-midi",
    category: "liboslar",
    title_uz: "Daffic kuzgi midi libos",
    title_ru: "Осеннее платье миди Daffic",
    price: 690000,
    old_price: null,
    sizes: ["36", "38", "40", "42", "44", "46"],
    colors: ["#5B3A29", "#8A6E4F", "#2A2A2A"],
    tags: ["New"],
    images: ["assets/daffic.jpg", "assets/libos3.jpg"],
    rating: 5,
    featured: true,
    in_stock: true,
  },
  {
    id: "layki-boots",
    category: "poyabzal",
    title_uz: "Layki charm etik",
    title_ru: "Кожаные ботинки Layki",
    price: 890000,
    old_price: null,
    sizes: ["36", "37", "38", "39", "40"],
    colors: ["#1C1C1C", "#5B3A29"],
    tags: ["New"],
    images: ["assets/layki.jpg", "assets/layki2.jpg"],
    rating: 5,
    featured: true,
    in_stock: true,
  },
  {
    id: "lv-imagination",
    category: "atirlar",
    title_uz: "Louis Vuitton Imagination",
    title_ru: "Louis Vuitton Imagination",
    price: 1200000,
    old_price: null,
    sizes: [],
    colors: [],
    tags: ["Hot"],
    images: ["assets/atir-symphony.jpg", "assets/atir-hero.jpg"],
    rating: 5,
    featured: true,
    in_stock: true,
  },
];

router.get("/", async (req, res, next) => {
  try {
    const { cat, featured, limit } = req.query;
    if (!hasDb()) {
      let items = [...FALLBACK];
      if (cat) items = items.filter((p) => p.category === cat);
      if (featured === "1") items = items.filter((p) => p.featured);
      if (limit) items = items.slice(0, Number(limit));
      return res.json({ items, source: "fallback" });
    }
    const params = [];
    const where = [];
    if (cat) {
      params.push(cat);
      where.push(`category = $${params.length}`);
    }
    if (featured === "1") where.push("featured = TRUE");
    const sql = `
      SELECT id, category, title_uz, title_ru, price, old_price, currency,
             sizes, colors, tags, images, rating, featured, in_stock
      FROM products
      ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY featured DESC, created_at DESC
      ${limit ? `LIMIT ${Number(limit)}` : ""}
    `;
    const { rows } = await query(sql, params);
    res.json({ items: rows, source: "db" });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!hasDb()) {
      const p = FALLBACK.find((x) => x.id === req.params.id);
      if (!p) return res.status(404).json({ error: "not_found" });
      return res.json(p);
    }
    const { rows } = await query(
      `SELECT id, category, title_uz, title_ru, price, old_price, currency,
              description_uz, description_ru, sizes, colors, tags, images, rating, in_stock
       FROM products WHERE id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "not_found" });
    res.json(rows[0]);
  } catch (e) {
    next(e);
  }
});

export default router;
