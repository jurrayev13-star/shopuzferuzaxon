import { Router } from "express";
import { query, hasDb } from "../db.js";
import { notifyOrder } from "../lib/notify.js";

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
      notifyOrder(row).then((r) => console.log("[notify]", JSON.stringify(r))).catch((e) => console.warn("[notify] err", e.message));
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
      const fullOrder = { ...orderRow, items: normalized };
      // Notify — fire and forget, javobga to'sqinlik qilmasin
      notifyOrder(fullOrder).then((r) => console.log("[notify]", JSON.stringify(r))).catch((e) => console.warn("[notify] err", e.message));
      res.json({ ok: true, order: fullOrder });
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

router.get("/mine", async (req, res, next) => {
  try {
    const phone = String(req.query.phone || "").trim();
    if (!phone) return res.status(400).json({ error: "phone_required" });
    if (!hasDb()) {
      return res.json({ items: memOrders.filter((o) => o.customer_phone === phone) });
    }
    const { rows: orders } = await query(
      `SELECT id, customer_name, customer_phone, address, city, delivery_fee,
              subtotal, total, status, note, created_at
       FROM orders WHERE customer_phone = $1 ORDER BY created_at DESC LIMIT 50`,
      [phone]
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
    res.json({ items: orders.map((o) => ({ ...o, items: itemsByOrder.get(o.id) || [] })) });
  } catch (e) {
    next(e);
  }
});

export default router;
