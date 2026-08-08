import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require(process.env.CODEX_SHARP_MODULE ?? "sharp");

const [logoPath, outputPath] = process.argv.slice(2);

if (!logoPath || !outputPath) {
  throw new Error(
    "Usage: node scripts/prepare-instagram-avatar.mjs <logo> <output>",
  );
}

const size = 1080;
const logo = await sharp(logoPath)
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize({ width: 760, height: 760, fit: "inside", withoutEnlargement: true })
  .png()
  .toBuffer();

const logoMeta = await sharp(logo).metadata();
const left = Math.round((size - (logoMeta.width ?? 0)) / 2);
const top = Math.round((size - (logoMeta.height ?? 0)) / 2);

await fs.mkdir(path.dirname(outputPath), { recursive: true });

await sharp({
  create: {
    width: size,
    height: size,
    channels: 4,
    background: { r: 250, g: 249, b: 245, alpha: 1 },
  },
})
  .composite([{ input: logo, left, top }])
  .png()
  .toFile(outputPath);

console.log(outputPath);
