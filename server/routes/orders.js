import { Router } from "express";
import { query, hasDb } from "../db.js";

const router = Router();

const memOrders = [];

router.post("/", async (req, res, next) => {
  try {
    const {
      customer_name,
      customer_phone,
      address,
      city,
      note,
      items,
      delivery_fee = 30000,
    } = req.body || {};

    if (!customer_name || !customer_phone) {
      return res.status(400).json({ error: "missing_customer" });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "empty_cart" });
    }
    const normalized = items.map((it) => ({
      product_id: String(it.id || it.product_id || it.key || ""),
      title: String(it.title || ""),
      price: Number(it.price) || 0,
      qty: Math.max(1, Number(it.qty) || 1),
      size: it.size ? String(it.size).slice(0, 20) : null,
      color: it.color ? String(it.color).slice(0, 20) : null,
      image: it.image ? String(it.image).slice(0, 300) : null,
    }));
    const subtotal = normalized.reduce((s, x) => s + x.price * x.qty, 0);
    const total = subtotal + Number(delivery_fee || 0);

    if (!hasDb()) {
      const id = memOrders.length + 1;
      const row = {
        id,
        customer_name,
        customer_phone,
        address,
        city,
        delivery_fee,
        subtotal,
        total,
        status: "new",
        note,
        items: normalized,
        created_at: new Date().toISOString(),
      };
      memOrders.push(row);
      return res.json({ ok: true, order: row });
    }

    const client = await (
      await import("../db.js")
    ).pool.connect();
    try {
      await client.query("BEGIN");
      const {
        rows: [orderRow],
      } = await client.query(
        `INSERT INTO orders (customer_name, customer_phone, address, city, delivery_fee, subtotal, total, note)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [
          customer_name,
          customer_phone,
          address || null,
          city || null,
          delivery_fee,
          subtotal,
          total,
          note || null,
        ]
      );
      for (const it of normalized) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, title, price, qty, size, color, image)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [
            orderRow.id,
            it.product_id,
            it.title,
            it.price,
            it.qty,
            it.size,
            it.color,
            it.image,
          ]
        );
      }
      await client.query("COMMIT");
      res.json({ ok: true, order: { ...orderRow, items: normalized } });
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }
  } catch (e) {
    next(e);
  }
});

export default router;
