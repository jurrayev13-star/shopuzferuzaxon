import { Router } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
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

function publicUser(u) {
  if (!u) return null;
  return { id: u.id, phone: u.phone, name: u.name, is_admin: !!u.is_admin };
}

async function findUserByPhone(phone) {
  if (hasDb()) {
    const { rows } = await query(
      "SELECT id, phone, name, password_hash, is_admin FROM users WHERE phone = $1",
      [phone]
    );
    return rows[0] || null;
  }
  return memUsers.get(phone) || null;
}

async function saveCode(phone, code, expiresAt) {
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
}

async function readCode(phone) {
  if (hasDb()) {
    const { rows } = await query(
      "SELECT code, expires_at, attempts FROM sms_codes WHERE phone = $1",
      [phone]
    );
    return rows[0]
      ? { code: rows[0].code, expiresAt: rows[0].expires_at, attempts: rows[0].attempts }
      : null;
  }
  return memCodes.get(phone) || null;
}

async function bumpAttempts(phone, rec) {
  if (hasDb()) {
    await query("UPDATE sms_codes SET attempts = attempts + 1 WHERE phone = $1", [phone]);
  } else if (rec) {
    rec.attempts += 1;
  }
}

async function clearCode(phone) {
  if (hasDb()) {
    await query("DELETE FROM sms_codes WHERE phone = $1", [phone]);
  } else {
    memCodes.delete(phone);
  }
}

// --- Step 1: telefonga SMS kod jo'natish (ro'yxatdan o'tishning boshi) ---
router.post("/send-code", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    if (!phone) return res.status(400).json({ error: "invalid_phone" });

    const existing = await findUserByPhone(phone);
    if (existing && existing.password_hash) {
      return res.status(409).json({ error: "already_registered", hint: "Bu raqam ro'yxatda bor. Kirish sahifasidan foydalaning." });
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await saveCode(phone, code, expiresAt);
    // TODO: real SMS provider (Eskiz.uz / Playmobile). Hozircha demo — kod javobda.
    console.log(`[sms] ${phone} kod: ${code}`);
    res.json({ ok: true, phone, demoCode: code, expiresInSec: 300 });
  } catch (e) {
    next(e);
  }
});

// --- Step 2: telefon + kod + parol → foydalanuvchi yaratish ---
router.post("/register", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    const code = String(req.body?.code || "").trim();
    const password = String(req.body?.password || "");
    const name = req.body?.name ? String(req.body.name).slice(0, 60).trim() : null;
    if (!phone || !code || !password) return res.status(400).json({ error: "bad_request" });
    if (password.length < 6) return res.status(400).json({ error: "weak_password", hint: "Kamida 6 belgi" });

    const rec = await readCode(phone);
    if (!rec) return res.status(400).json({ error: "no_code" });
    if (new Date(rec.expiresAt).getTime() < Date.now()) return res.status(400).json({ error: "code_expired" });
    if (rec.attempts >= 5) return res.status(429).json({ error: "too_many_attempts" });
    if (rec.code !== code) {
      await bumpAttempts(phone, rec);
      return res.status(400).json({ error: "wrong_code" });
    }

    const existing = await findUserByPhone(phone);
    if (existing && existing.password_hash) {
      return res.status(409).json({ error: "already_registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    let user;
    if (hasDb()) {
      const { rows } = await query(
        `INSERT INTO users (phone, name, password_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (phone) DO UPDATE
           SET name = COALESCE(EXCLUDED.name, users.name),
               password_hash = EXCLUDED.password_hash
         RETURNING id, phone, name, is_admin`,
        [phone, name, hash]
      );
      user = rows[0];
    } else {
      user = { id: memUsers.size + 1, phone, name, password_hash: hash, is_admin: false };
      memUsers.set(phone, user);
    }
    await clearCode(phone);
    res.json({ ok: true, user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

// --- Kirish: telefon + parol ---
router.post("/login", async (req, res, next) => {
  try {
    const phone = normalizePhone(req.body?.phone);
    const password = String(req.body?.password || "");
    if (!phone || !password) return res.status(400).json({ error: "bad_request" });

    const user = await findUserByPhone(phone);
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: "not_registered", hint: "Bu raqam ro'yxatdan o'tmagan. Avval ro'yxatdan o'ting." });
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "wrong_password" });
    res.json({ ok: true, user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

export default router;
