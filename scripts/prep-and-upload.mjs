#!/usr/bin/env node
/**
 * Batch prep + upload for a photography roll.
 *
 * Reads JPEGs from a local folder (WSL or Windows path via /mnt/c/...),
 * resizes each to web spec (2000 px long edge, JPEG q=80, EXIF kept),
 * uploads to Cloudinary at lens/<slug>/NN, and writes a draft roll
 * JSON skeleton for Sveltia to pick up.
 *
 * Usage:
 *   pnpm prep <roll-slug> <folder-path> [--force]
 *
 * Examples:
 *   pnpm prep tempelhof "/mnt/c/Users/Ercan/Pictures/scans/2026-05"
 *   pnpm prep bosporus inbox/bosporus-roll --force
 *
 * Env vars (loaded by `node --env-file=.env.local` in the npm script):
 *   PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * After running:
 *   1. git commit + push the new src/content/rolls/<slug>.json
 *   2. Open /photojockeysblog/ → Rolls → fill text fields → Save & Publish
 *   3. Vercel rebuild runs sync-exif.mjs → captions populate on the live site
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename, resolve } from 'node:path';
import sharp from 'sharp';
import cloudinary from 'cloudinary';

const ROLLS_DIR = 'src/content/rolls';

const args = process.argv.slice(2);
const force = args.includes('--force');
const positional = args.filter((a) => !a.startsWith('--'));
const [slug, folderArg] = positional;

const usage = () => {
  console.error(
    'Usage: pnpm prep <roll-slug> <folder-path> [--force]\n' +
      '  <roll-slug>   lowercase letters, digits, hyphens (e.g. tempelhof)\n' +
      '  <folder-path> absolute or relative path to a folder of JPEGs\n' +
      '  --force       overwrite existing Cloudinary assets and roll JSON',
  );
  process.exit(1);
};

if (!slug || !folderArg) usage();

if (!/^[a-z0-9-]+$/.test(slug)) {
  console.error(
    `Invalid slug "${slug}". Use lowercase letters, digits, hyphens only.`,
  );
  process.exit(1);
}

const folder = resolve(folderArg);
if (!existsSync(folder)) {
  console.error(`Folder not found: ${folder}`);
  process.exit(1);
}

const folderStat = await stat(folder);
if (!folderStat.isDirectory()) {
  console.error(`Not a directory: ${folder}`);
  process.exit(1);
}

const cloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error(
    'Cloudinary credentials missing. Need PUBLIC_CLOUDINARY_CLOUD_NAME, ' +
      'CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env.local.',
  );
  process.exit(1);
}

cloudinary.v2.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

const allEntries = await readdir(folder, { withFileTypes: true });
const jpegs = allEntries
  .filter((e) => e.isFile() && /\.(jpe?g)$/i.test(e.name))
  .map((e) => e.name)
  .sort();

const skipped = allEntries.filter(
  (e) => !(e.isFile() && /\.(jpe?g)$/i.test(e.name)),
);
for (const e of skipped) {
  console.warn(`  skipping ${e.name} (not a JPEG)`);
}

if (jpegs.length === 0) {
  console.error(`No JPEGs found in ${folder}. Nothing to do.`);
  process.exit(1);
}

const rollJsonPath = join(ROLLS_DIR, `${slug}.json`);
if (existsSync(rollJsonPath) && !force) {
  console.error(
    `${rollJsonPath} already exists. Re-run with --force to overwrite.`,
  );
  process.exit(1);
}

console.log(
  `Found ${jpegs.length} JPEG(s) in ${folder}. Uploading to lens/${slug}/...`,
);

const uploadBuffer = (buffer, publicId) =>
  new Promise((res, rej) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      {
        public_id: publicId,
        overwrite: force,
        resource_type: 'image',
      },
      (err, result) => (err ? rej(err) : res(result)),
    );
    stream.end(buffer);
  });

const photos = [];
for (let i = 0; i < jpegs.length; i++) {
  const filename = jpegs[i];
  const nn = String(i + 1).padStart(2, '0');
  const publicId = `lens/${slug}/${nn}`;

  try {
    const raw = await readFile(join(folder, filename));
    const resized = await sharp(raw)
      .rotate()
      .resize({
        width: 2000,
        height: 2000,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .keepMetadata()
      .jpeg({ quality: 80 })
      .toBuffer();

    const result = await uploadBuffer(resized, publicId);
    console.log(
      `  [${i + 1}/${jpegs.length}] ${filename} → ${publicId} ` +
        `(${result.width}×${result.height}, ${Math.round(resized.length / 1024)} KB)`,
    );

    photos.push({ cldPath: publicId, alt: '', caption: '' });
  } catch (err) {
    console.error(`  [${i + 1}/${jpegs.length}] ${filename} FAILED: ${err.message}`);
    if (err.http_code === 409 || /already exists/i.test(err.message || '')) {
      console.error(
        '    → Cloudinary asset already exists. Re-run with --force to overwrite.',
      );
    }
    process.exit(1);
  }
}

const today = new Date().toISOString().slice(0, 10);
// No explicit cover — roll cards fall back to the first photo.
const roll = {
  title: '',
  date: today,
  location: '',
  photos,
  draft: true,
};

await writeFile(rollJsonPath, JSON.stringify(roll, null, 2) + '\n');

console.log(
  `\nWrote ${photos.length} photo(s) to ${rollJsonPath} (draft).\n` +
    `Next: commit + push the JSON, then open /photojockeysblog/ → Rolls → ${slug}\n` +
    `      to fill title/location/alts/captions and publish.`,
);
