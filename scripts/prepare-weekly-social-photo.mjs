import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const sharp = require(process.env.CODEX_SHARP_MODULE ?? "sharp");

const [inputPath, outputDir] = process.argv.slice(2);

if (!inputPath || !outputDir) {
  throw new Error(
    "Usage: node scripts/prepare-weekly-social-photo.mjs <input> <output-dir>",
  );
}

const feed = { width: 1080, height: 1350 };
const story = { width: 1080, height: 1920 };
const newPostStickerPath = path.resolve(
  "social/branding/new-post-sticker.webp",
);

async function newPostSticker() {
  return sharp(newPostStickerPath)
    .trim()
    .resize({ width: 240 })
    .webp()
    .toBuffer();
}

async function renderFeed() {
  const base = await sharp(inputPath)
    .rotate()
    .resize(feed.width, feed.height, { fit: "cover", position: "centre" })
    .webp()
    .toBuffer();

  return sharp(base)
    .webp({ quality: 90 })
    .toFile(path.join(outputDir, "feed-preview.webp"));
}

async function renderStory() {
  const background = await sharp(inputPath)
    .rotate()
    .resize(story.width, story.height, { fit: "cover" })
    .blur(24)
    .modulate({ brightness: 0.54, saturation: 0.85 })
    .webp()
    .toBuffer();
  const foreground = await sharp(inputPath)
    .rotate()
    .resize(story.width, story.height, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .webp()
    .toBuffer();
  const newPostStickerImage = await newPostSticker();

  return sharp(background)
    .composite([
      { input: foreground, left: 0, top: 0 },
      { input: newPostStickerImage, left: story.width - 300, top: 230 },
    ])
    .webp({ quality: 90 })
    .toFile(path.join(outputDir, "story-preview.webp"));
}

async function renderSource() {
  return sharp(inputPath)
    .rotate()
    .webp({ quality: 92 })
    .toFile(path.join(outputDir, "source-candidate.webp"));
}

await fs.mkdir(outputDir, { recursive: true });
await Promise.all([renderSource(), renderFeed(), renderStory()]);
console.log(path.join(outputDir, "source-candidate.webp"));
console.log(path.join(outputDir, "feed-preview.webp"));
console.log(path.join(outputDir, "story-preview.webp"));
