#!/usr/bin/env node
/*
  Pixelate an image by downscaling and upscaling with nearest-neighbor.

  Usage:
    node scripts/pixelate-image.js [inputPath] [outputPath] [--pixel=8]

  Defaults:
    inputPath  = public/images/Gemini_Generated_Image_kz5l8ykz5l8ykz5l (2).png
    outputPath = public/images/Gemini_Generated_Image_kz5l8ykz5l8ykz5l (2).pixel.png
    --pixel    = 8 (bigger -> blockier)
*/

const fs = require("fs");
const path = require("path");

function getArg(name, fallback) {
  const match = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!match) return fallback;
  const val = match.split("=")[1];
  return val ?? fallback;
}

function abs(p) {
  return path.resolve(process.cwd(), p);
}

async function main() {
  const args = process.argv.slice(2);
  const positional = args.filter((a) => !a.startsWith("--"));
  const inputArg = positional[0];
  const outputArg = positional[1];
  const pixelArg = Number(getArg("pixel", "8"));
  const pixel = Number.isFinite(pixelArg) && pixelArg > 0 ? pixelArg : 8;

  const defaultInput = "public/images/Gemini_Generated_Image_kz5l8ykz5l8ykz5l (2).png";
  const defaultOutput = "public/images/Gemini_Generated_Image_kz5l8ykz5l8ykz5l (2).pixel.png";

  const inputPath = abs(inputArg || defaultInput);
  const outputPath = abs(outputArg || defaultOutput);

  if (!fs.existsSync(inputPath)) {
    console.error(`Input image not found: ${inputPath}`);
    process.exit(1);
  }

  let sharp;
  try {
    sharp = require("sharp");
  } catch (err) {
    console.error("Missing dependency: sharp\nInstall it with: npm i -D sharp");
    process.exit(1);
  }

  try {
    const meta = await sharp(inputPath).metadata();
    const origW = meta.width || 0;
    const origH = meta.height || 0;
    if (!origW || !origH) {
      throw new Error("Could not read image dimensions");
    }

    const downW = Math.max(1, Math.floor(origW / pixel));
    const downH = Math.max(1, Math.floor(origH / pixel));

    await sharp(inputPath)
      // downscale
      .resize(downW, downH, { kernel: sharp.kernel.nearest, fit: "fill" })
      // upscale back to original with nearest to get hard blocks
      .resize(origW, origH, { kernel: sharp.kernel.nearest, fit: "fill" })
      .toFile(outputPath);

    console.log(`✔ Pixelated image written to: ${outputPath}`);
  } catch (err) {
    console.error("Failed to pixelate image:", err);
    process.exit(1);
  }
}

main();


