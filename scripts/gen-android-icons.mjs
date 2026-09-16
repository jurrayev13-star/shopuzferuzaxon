import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "design_handoff_shopuz", "assets", "feruzaxon-logo.jpg");
const RES = path.join(__dirname, "..", "android", "app", "src", "main", "res");

// feruzaxon-logo.jpg (640x640) — o'z holicha, qirqim yo'q.
const cropped = await sharp(SRC).resize(1024, 1024, { fit: "cover" }).toBuffer();

// Fon rangi — logo pushti fon: #f7d7d7 (yumshoq pushti)
const PINK = { r: 247, g: 215, b: 215, alpha: 1 };

const densities = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

for (const [d, size] of Object.entries(densities)) {
  const dir = path.join(RES, `mipmap-${d}`);
  await mkdir(dir, { recursive: true });
  // Legacy launcher icon — logo kvadrat (Android uni yumaloq/squircle qilib maskalaydi)
  const legacy = await sharp(cropped).resize(size, size, { fit: "cover" }).png({ compressionLevel: 9 }).toBuffer();
  await sharp(legacy).toFile(path.join(dir, "ic_launcher.png"));
  await sharp(legacy).toFile(path.join(dir, "ic_launcher_round.png"));
  console.log(`mipmap-${d} ${size}x${size} ✓`);
}

// Adaptive icon foreground — 432×432 (108dp @ xxxhdpi), safe zone 66%
// Logo 66% zonada joylashadi, atrofi shaffof — background alohida ranglanadi
const FG_SIZE = 432;
const SAFE = Math.round(FG_SIZE * 0.85); // ~367 — kattaroq safe zone, logo yiriroq ko'rinadi
const inner = await sharp(cropped).resize(SAFE, SAFE, { fit: "cover" }).toBuffer();
await sharp({
  create: { width: FG_SIZE, height: FG_SIZE, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: inner, gravity: "center" }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(RES, "drawable", "ic_launcher_foreground.png"));

console.log("drawable/ic_launcher_foreground.png ✓ (432x432)");
