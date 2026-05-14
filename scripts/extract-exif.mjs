#!/usr/bin/env node
/**
 * Extract EXIF from a directory of JPEGs and write a roll skeleton
 * JSON file ready to drop into src/content/rolls/<slug>.json.
 *
 * Usage:
 *   node scripts/extract-exif.mjs <roll-slug> <inbox-dir>
 *
 * Example:
 *   node scripts/extract-exif.mjs tempelhof inbox/2026-05-tempelhof/
 *
 * After running:
 *   1. Open src/content/rolls/<roll-slug>.json
 *   2. Fill in `title`, `location`, `cover`, per-photo `caption`
 *   3. Upload the source JPEGs to Cloudinary as
 *      lens/<roll-slug>/01.jpg, lens/<roll-slug>/02.jpg, ...
 *      (via the dashboard or `cld uploader upload`)
 *   4. Flip `draft: false` (or remove the field) and commit.
 *
 * Does NOT upload. Decoupled by design so JSON can be reviewed
 * before publishing.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import exifr from 'exifr';

const [, , slug, inbox] = process.argv;

if (!slug || !inbox) {
  console.error('Usage: node scripts/extract-exif.mjs <roll-slug> <inbox-dir>');
  process.exit(1);
}

const ROLL_DIR = 'src/content/rolls';
const outPath = join(ROLL_DIR, `${slug}.json`);

const isJpeg = (name) => /\.(jpe?g)$/i.test(name);

const files = (await readdir(inbox))
  .filter(isJpeg)
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (files.length === 0) {
  console.error(`No JPEGs found in ${inbox}`);
  process.exit(1);
}

const formatAperture = (fNumber) =>
  typeof fNumber === 'number' ? `f/${fNumber.toFixed(1).replace(/\.0$/, '')}` : undefined;

const formatShutter = (exposureTime) => {
  if (typeof exposureTime !== 'number' || exposureTime <= 0) return undefined;
  if (exposureTime >= 1) return `${exposureTime}s`;
  return `1/${Math.round(1 / exposureTime)}`;
};

const formatFocalLength = (focal) =>
  typeof focal === 'number' ? `${Math.round(focal)}mm` : undefined;

const photos = [];
for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const n = String(i + 1).padStart(2, '0');
  const buf = await readFile(join(inbox, file));
  const raw = (await exifr.parse(buf, { gps: false })) ?? {};

  const camera = [raw.Make, raw.Model].filter(Boolean).join(' ').trim() || undefined;

  photos.push({
    cldPath: `lens/${slug}/${n}`,
    alt: '',
    caption: '',
    exif: {
      camera,
      lens: raw.LensModel || undefined,
      iso: typeof raw.ISO === 'number' ? raw.ISO : undefined,
      aperture: formatAperture(raw.FNumber),
      shutter: formatShutter(raw.ExposureTime),
      focalLength: formatFocalLength(raw.FocalLength),
      dateTaken: raw.DateTimeOriginal
        ? new Date(raw.DateTimeOriginal).toISOString()
        : undefined,
    },
    _sourceFile: basename(file),
  });
}

await mkdir(ROLL_DIR, { recursive: true });

const skeleton = {
  title: '',
  date: new Date().toISOString().slice(0, 10),
  location: '',
  cover: {
    cldPath: `lens/${slug}/01`,
    alt: '',
  },
  photos: photos.map(({ _sourceFile, ...rest }) => rest),
  draft: true,
};

await writeFile(outPath, JSON.stringify(skeleton, null, 2) + '\n');

console.log(`Wrote ${photos.length} photo(s) to ${outPath}`);
console.log('Next: fill in title/location/cover/captions, upload to Cloudinary, flip draft.');
console.log('Source-file order (for upload reference):');
for (const p of photos) console.log(`  ${p.cldPath} ← ${p._sourceFile}`);
