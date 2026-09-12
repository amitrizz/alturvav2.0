/**
 * Generates PWA / favicon PNGs from public/logo.png (same as header logo).
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const logoPath = join(publicDir, "logo.png");
const BG = { r: 3, g: 7, b: 18, alpha: 1 }; // #030712

async function renderIcon(sharp, size, logoScale, filename) {
  const logoSize = Math.round(size * logoScale);
  const logo = await sharp(logoPath)
    .resize(logoSize, logoSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const offset = Math.round((size - logoSize) / 2);
  const out = join(publicDir, filename);

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logo, left: offset, top: offset }])
    .png()
    .toFile(out);

  console.log(`Created ${out}`);
}

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("[pwa-icons] sharp not installed — run: npm install -D sharp");
    process.exit(0);
  }

  await renderIcon(sharp, 32, 0.9, "favicon-32x32.png");
  await renderIcon(sharp, 180, 0.88, "apple-touch-icon.png");
  await renderIcon(sharp, 192, 0.88, "pwa-192x192.png");
  await renderIcon(sharp, 512, 0.88, "pwa-512x512.png");
  await renderIcon(sharp, 512, 0.72, "pwa-512x512-maskable.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
