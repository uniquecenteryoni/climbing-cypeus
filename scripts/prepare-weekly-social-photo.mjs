import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require(process.env.CODEX_SHARP_MODULE ?? "sharp");

const [inputPath, outputDir, providedLogoPath] = process.argv.slice(2);
const logoPath = providedLogoPath ?? path.resolve("pics/climbing-cyprus-logo.webp");

if (!inputPath || !outputDir) {
  throw new Error(
    "Usage: node scripts/prepare-weekly-social-photo.mjs <input> <output-dir> [logo]",
  );
}

const feed = { width: 1080, height: 1350 };
const story = { width: 1080, height: 1920 };

function brandingSvg(width, height, { bottom = 48, scale = 1 } = {}) {
  const badge = Math.round(142 * scale);
  const x = Math.round(48 * scale);
  const y = height - bottom - badge;
  const dividerX = x + badge + Math.round(24 * scale);
  const textX = dividerX + Math.round(26 * scale);
  const mottoSize = Math.round(29 * scale);
  const urlSize = Math.round(29 * scale);
  const footerHeight = Math.round(265 * scale);

  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <linearGradient id="footer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#080808" stop-opacity="0"/>
          <stop offset="100%" stop-color="#080808" stop-opacity="0.82"/>
        </linearGradient>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" flood-color="#000" flood-opacity="0.45"/>
        </filter>
      </defs>
      <rect x="0" y="${height - footerHeight}" width="${width}" height="${footerHeight}" fill="url(#footer)"/>
      <circle cx="${x + badge / 2}" cy="${y + badge / 2}" r="${badge / 2 - 2}" fill="#f8f7f2" stroke="#fff" stroke-width="4" filter="url(#shadow)"/>
      <rect x="${dividerX}" y="${y + 11}" width="3" height="${badge - 22}" rx="1.5" fill="#f4c51d"/>
      <text x="${textX}" y="${y + 57}" fill="#fff"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="${mottoSize}" font-weight="700" letter-spacing="1.2">CLIMB | EXPLORE | CONNECT</text>
      <text x="${textX}" y="${y + 105}" fill="#fff" fill-opacity="0.96"
        font-family="Helvetica Neue, Helvetica, Arial, sans-serif"
        font-size="${urlSize}" font-weight="600" letter-spacing="0.5">climbing-cyprus.com</text>
    </svg>
  `);
}

async function logoForBadge(size) {
  const inner = Math.round(size * 0.78);
  return sharp(logoPath)
    .trim({ background: "#f8f7f2" })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

async function renderFeed() {
  const badgeSize = 142;
  const logo = await logoForBadge(badgeSize);
  const base = await sharp(inputPath)
    .rotate()
    .resize(feed.width, feed.height, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  return sharp(base)
    .composite([
      { input: brandingSvg(feed.width, feed.height, { bottom: 48 }), left: 0, top: 0 },
      { input: logo, left: 48 + Math.round((badgeSize - 0.78 * badgeSize) / 2), top: feed.height - 48 - badgeSize + Math.round((badgeSize - 0.78 * badgeSize) / 2) },
    ])
    .jpeg({ quality: 94, chromaSubsampling: "4:4:4" })
    .toFile(path.join(outputDir, "feed-preview.jpg"));
}

async function renderStory() {
  const badgeSize = 142;
  const logo = await logoForBadge(badgeSize);
  const background = await sharp(inputPath)
    .rotate()
    .resize(story.width, story.height, { fit: "cover" })
    .blur(24)
    .modulate({ brightness: 0.54, saturation: 0.85 })
    .png()
    .toBuffer();
  const foreground = await sharp(inputPath)
    .rotate()
    .resize(story.width, story.height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  const bottom = 235;

  return sharp(background)
    .composite([
      { input: foreground, left: 0, top: 0 },
      { input: brandingSvg(story.width, story.height, { bottom }), left: 0, top: 0 },
      { input: logo, left: 48 + Math.round((badgeSize - 0.78 * badgeSize) / 2), top: story.height - bottom - badgeSize + Math.round((badgeSize - 0.78 * badgeSize) / 2) },
    ])
    .jpeg({ quality: 94, chromaSubsampling: "4:4:4" })
    .toFile(path.join(outputDir, "story-preview.jpg"));
}

await fs.mkdir(outputDir, { recursive: true });
await Promise.all([renderFeed(), renderStory()]);
console.log(path.join(outputDir, "feed-preview.jpg"));
console.log(path.join(outputDir, "story-preview.jpg"));
