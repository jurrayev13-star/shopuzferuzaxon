import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RES = path.join(__dirname, "..", "android", "app", "src", "main", "res");
const BRAND = { r: 46, g: 158, b: 123, alpha: 1 }; // #2e9e7b

const densities = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

function svgIcon(size) {
  const s = Math.round(size * 0.55);
  return Buffer.from(`
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#2e9e7b"/>
  <text x="50%" y="55%" font-family="Georgia,serif" font-size="${s}" font-weight="700" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">S</text>
</svg>`);
}

for (const [d, size] of Object.entries(densities)) {
  const dir = path.join(RES, `mipmap-${d}`);
  await mkdir(dir, { recursive: true });
  const svg = svgIcon(size);
  await sharp(svg).png().toFile(path.join(dir, "ic_launcher.png"));
  await sharp(svg).png().toFile(path.join(dir, "ic_launcher_round.png"));
  console.log(`mipmap-${d} ${size}x${size} yozildi`);
}
