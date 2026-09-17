import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "design_handoff_shopuz", "assets", "app-icon.png");
const RES = path.join(__dirname, "..", "android", "app", "src", "main", "res");
const PINK = { r: 247, g: 217, b: 217, alpha: 1 }; // logo foni

// app-icon.png allaqachon kvadrat ikonka shaklida (pushti fon + F + gullar).
// Shaffof qirralarni trim qilib, sof kvadrat olamiz.
const trimmed = await sharp(SRC).trim({ threshold: 20 }).toBuffer();
const base = await sharp(trimmed).resize(1024, 1024, { fit: "cover", background: PINK }).png().toBuffer();

const densities = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };

for (const [d, size] of Object.entries(densities)) {
  const dir = path.join(RES, `mipmap-${d}`);
  await mkdir(dir, { recursive: true });
  const png = await sharp(base).resize(size, size, { fit: "cover" }).png({ compressionLevel: 9 }).toBuffer();
  await sharp(png).toFile(path.join(dir, "ic_launcher.png"));
  await sharp(png).toFile(path.join(dir, "ic_launcher_round.png"));
  console.log(`mipmap-${d} ${size}x${size} ✓`);
}

// Adaptive icon foreground — 432×432, logo 90% safe zone da (kattaroq ko'rinsin)
const FG = 432;
const SAFE = Math.round(FG * 0.90);
const inner = await sharp(base).resize(SAFE, SAFE, { fit: "cover" }).toBuffer();
await sharp({
  create: { width: FG, height: FG, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([{ input: inner, gravity: "center" }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(RES, "drawable", "ic_launcher_foreground.png"));
console.log("drawable/ic_launcher_foreground.png ✓");
