import { Router } from "express";
import { query, hasDb } from "../db.js";

const router = Router();

function requireAdmin(req, res, next) {
  const token = req.get("x-admin-token") || req.query.admin;
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    return res.status(503).json({ error: "admin_disabled", hint: "ADMIN_TOKEN o'rnatilmagan" });
  }
  if (token !== expected) {
    return res.status(401).json({ error: "unauthorized" });
  }
  next();
}

router.get("/orders", requireAdmin, async (_req, res, next) => {
  try {
    if (!hasDb()) return res.json({ items: [] });
    const { rows: orders } = await query(
      `SELECT id, customer_name, customer_phone, address, city, delivery_fee,
              subtotal, total, status, note, created_at
       FROM orders ORDER BY created_at DESC LIMIT 200`
    );
    const ids = orders.map((o) => o.id);
    let itemsByOrder = new Map();
    if (ids.length) {
      const { rows: items } = await query(
        `SELECT order_id, product_id, title, price, qty, size, color, image
         FROM order_items WHERE order_id = ANY($1::bigint[])`,
        [ids]
      );
      for (const it of items) {
        if (!itemsByOrder.has(it.order_id)) itemsByOrder.set(it.order_id, []);
        itemsByOrder.get(it.order_id).push(it);
      }
    }
    res.json({
      items: orders.map((o) => ({ ...o, items: itemsByOrder.get(o.id) || [] })),
    });
  } catch (e) {
    next(e);
  }
});

router.patch("/orders/:id", requireAdmin, async (req, res, next) => {
  try {
    if (!hasDb()) return res.status(503).json({ error: "db_required" });
    const status = String(req.body?.status || "").slice(0, 30);
    if (!status) return res.status(400).json({ error: "status_required" });
    const { rows } = await query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status",
      [status, req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "not_found" });
    res.json({ ok: true, order: rows[0] });
  } catch (e) {
    next(e);
  }
});

export default router;
