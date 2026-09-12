/**
 * Generates PWA PNG icons from public/pwa-icon.svg using sharp (dev-only).
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");
const svgPath = join(publicDir, "pwa-icon.svg");

async function main() {
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("[pwa-icons] sharp not installed — run: npm install -D sharp");
    console.warn("[pwa-icons] Skipping PNG generation. Install vite-plugin-pwa or add icons manually.");
    process.exit(0);
  }

  const svg = await readFile(svgPath);
  const sizes = [192, 512];

  for (const size of sizes) {
    const out = join(publicDir, `pwa-${size}x${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(out);
    console.log(`Created ${out}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
