import pg from "pg";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

export const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: connectionString.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    })
  : null;

export function hasDb() {
  return pool !== null;
}

export async function query(text, params) {
  if (!pool) throw new Error("DATABASE_URL o'rnatilmagan");
  return pool.query(text, params);
}

export async function initDb() {
  if (!pool) {
    console.warn("[db] DATABASE_URL yo'q — DB'siz ishlaymiz (in-memory)");
    return;
  }
  const schema = await readFile(
    path.join(__dirname, "schema.sql"),
    "utf8"
  );
  await pool.query(schema);
  console.log("[db] schema tayyor");

  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM products");
  if (rows[0].n === 0) {
    const seed = await readFile(path.join(__dirname, "seed.sql"), "utf8");
    await pool.query(seed);
    console.log("[db] seed data qo'shildi");
  }
}
