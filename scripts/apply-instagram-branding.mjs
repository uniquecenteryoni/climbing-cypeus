import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require(process.env.CODEX_SHARP_MODULE ?? "sharp");

const [inputPath, outputPath, providedLogoPath] = process.argv.slice(2);
// The standard footer is dark, so use the white lockup for contrast by default.
const logoPath = providedLogoPath ?? path.resolve("pics/climbing-cyprus-logo-white.webp");

if (!inputPath || !outputPath) {
  throw new Error(
    "Usage: node scripts/apply-instagram-branding.mjs <input> <output> [logo]",
  );
}

const image = sharp(inputPath);
const metadata = await image.metadata();
const width = metadata.width;
const height = metadata.height;

if (!width || !height) {
  throw new Error("Could not read the source image dimensions.");
}

const scale = width / 1200;
const footerHeight = Math.round(210 * scale);
const sidePadding = Math.round(52 * scale);
const logoWidth = Math.round(112 * scale);
const dividerX = sidePadding + logoWidth + Math.round(24 * scale);
const textX = dividerX + Math.round(28 * scale);
const baselineY = height - Math.round(72 * scale);
const titleSize = Math.round(38 * scale);
const urlSize = Math.round(23 * scale);

const logo = await sharp(logoPath)
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize({ width: logoWidth, fit: "inside", withoutEnlargement: true })
  .png()
  .toBuffer();

const logoMeta = await sharp(logo).metadata();
const logoTop = height - Math.round(118 * scale);

const overlay = Buffer.from(`
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="footer" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#101010" stop-opacity="0"/>
        <stop offset="100%" stop-color="#101010" stop-opacity="0.68"/>
      </linearGradient>
    </defs>
    <rect x="0" y="${height - footerHeight}" width="${width}" height="${footerHeight}" fill="url(#footer)"/>
    <rect x="${dividerX}" y="${height - Math.round(128 * scale)}" width="${Math.max(2, Math.round(3 * scale))}" height="${Math.round(82 * scale)}" rx="${Math.round(2 * scale)}" fill="#f4c51d"/>
    <text x="${textX}" y="${baselineY - Math.round(24 * scale)}"
      fill="#ffffff" font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
      font-size="${titleSize}" font-weight="700" letter-spacing="${Math.round(2 * scale)}">CLIMBING CYPRUS</text>
    <text x="${textX}" y="${baselineY + Math.round(15 * scale)}"
      fill="#ffffff" fill-opacity="0.92"
      font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
      font-size="${urlSize}" font-weight="400" letter-spacing="${Math.max(1, Math.round(scale))}">climbing-cyprus.com</text>
  </svg>
`);

await fs.mkdir(path.dirname(outputPath), { recursive: true });

await image
  .composite([
    { input: overlay, left: 0, top: 0 },
    {
      input: logo,
      left: sidePadding,
      top: logoTop + Math.round((Math.round(82 * scale) - (logoMeta.height ?? 0)) / 2),
    },
  ])
  .png()
  .toFile(outputPath);

console.log(outputPath);
