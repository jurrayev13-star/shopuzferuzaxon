import { Router } from "express";
import crypto from "node:crypto";
import { query, hasDb } from "../db.js";

const router = Router();

const memCodes = new Map();
const memUsers = new Map();

function normalizePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("998")) return "+" + digits;
  if (digits.length === 9) return "+998" + digits;
  return null;
}

function generateCode() {
  return String(crypto.randomInt(10000, 100000));
}

router.post("/send-code", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    if (!phone) {
      return res.status(400).json({ error: "invalid_phone" });
    }
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    if (hasDb()) {
      await query(
        `INSERT INTO sms_codes (phone, code, expires_at, attempts)
         VALUES ($1, $2, $3, 0)
         ON CONFLICT (phone) DO UPDATE
           SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at, attempts = 0`,
        [phone, code, expiresAt]
      );
    } else {
      memCodes.set(phone, { code, expiresAt, attempts: 0 });
    }

    // TODO: real SMS provider (Eskiz.uz / Playmobile). Hozircha demo — kod javobda.
    console.log(`[sms] ${phone} kod: ${code}`);
    res.json({ ok: true, phone, demoCode: code, expiresInSec: 300 });
  } catch (e) {
    next(e);
  }
});

router.post("/verify", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    const code = String(req.body?.code || "").trim();
    const name = req.body?.name ? String(req.body.name).slice(0, 60) : null;
    if (!phone || !code) return res.status(400).json({ error: "bad_request" });

    let record;
    if (hasDb()) {
      const { rows } = await query(
        "SELECT code, expires_at, attempts FROM sms_codes WHERE phone = $1",
        [phone]
      );
      record = rows[0]
        ? {
            code: rows[0].code,
            expiresAt: rows[0].expires_at,
            attempts: rows[0].attempts,
          }
        : null;
    } else {
      record = memCodes.get(phone);
    }
    if (!record) return res.status(400).json({ error: "no_code" });
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return res.status(400).json({ error: "code_expired" });
    }
    if (record.attempts >= 5) {
      return res.status(429).json({ error: "too_many_attempts" });
    }
    if (record.code !== code) {
      if (hasDb()) {
        await query(
          "UPDATE sms_codes SET attempts = attempts + 1 WHERE phone = $1",
          [phone]
        );
      } else {
        record.attempts += 1;
      }
      return res.status(400).json({ error: "wrong_code" });
    }

    let user;
    if (hasDb()) {
      const upserted = await query(
        `INSERT INTO users (phone, name)
         VALUES ($1, $2)
         ON CONFLICT (phone) DO UPDATE SET name = COALESCE(EXCLUDED.name, users.name)
         RETURNING id, phone, name, is_admin`,
        [phone, name]
      );
      user = upserted.rows[0];
      await query("DELETE FROM sms_codes WHERE phone = $1", [phone]);
    } else {
      const existing = memUsers.get(phone) || {
        id: memUsers.size + 1,
        phone,
        name,
        is_admin: false,
      };
      if (name) existing.name = name;
      memUsers.set(phone, existing);
      memCodes.delete(phone);
      user = existing;
    }

    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
});

export default router;
