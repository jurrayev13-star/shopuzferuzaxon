import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(__dirname, "..", "design_handoff_shopuz", "assets", "feruzaxon-logo.jpg");
const outDir = path.join(__dirname, "..", "design_handoff_shopuz", "assets", "icons");
const BRAND = { r: 46, g: 158, b: 123, alpha: 1 };

await mkdir(outDir, { recursive: true });

// Full-bleed
await sharp(src).resize(192, 192, { fit: "cover" }).png({ compressionLevel: 9 })
  .toFile(path.join(outDir, "icon-192.png"));
await sharp(src).resize(512, 512, { fit: "cover" }).png({ compressionLevel: 9 })
  .toFile(path.join(outDir, "icon-512.png"));
// Apple touch icon (180x180 with a bit of padding to look nicer as home-screen icon)
await sharp(src).resize(180, 180, { fit: "cover" }).png({ compressionLevel: 9 })
  .toFile(path.join(outDir, "apple-touch-icon.png"));

// Maskable: logo at ~62% inside the safe zone, brand-color background fills padding
const inner = Math.round(512 * 0.62);
const logoBuf = await sharp(src).resize(inner, inner, { fit: "cover" }).png().toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: BRAND },
})
  .composite([{ input: logoBuf, gravity: "center" }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(outDir, "icon-512-maskable.png"));

console.log("icons written to", outDir);
