#!/usr/bin/env node
/**
 * Fetch EXIF from Cloudinary for every photo referenced in
 * src/content/rolls/*.json and cache it in .astro/exif-cache.json.
 *
 * Runs as a build step before astro check. The content loader in
 * src/lib/content.ts (getAllRolls) merges this cache into each
 * photo at read time.
 *
 * Graceful degrade: if CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
 * is missing, logs a warning and exits 0. Build continues; rolls
 * render without EXIF until the env vars are set.
 */
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import cloudinary from 'cloudinary';

const ROLLS_DIR = 'src/content/rolls';
const CACHE_DIR = '.astro';
const CACHE_FILE = join(CACHE_DIR, 'exif-cache.json');

const cloudName = process.env.PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn(
    'sync-exif: Cloudinary credentials missing (need PUBLIC_CLOUDINARY_CLOUD_NAME, ' +
      'CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET). Skipping EXIF backfill — ' +
      'rolls will render without EXIF until env vars are set.',
  );
  process.exit(0);
}

cloudinary.v2.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

const formatAperture = (n) =>
  typeof n === 'number' ? `f/${n.toFixed(1).replace(/\.0$/, '')}` : undefined;

const formatShutter = (n) => {
  if (typeof n !== 'number' || n <= 0) return undefined;
  if (n >= 1) return `${n}s`;
  return `1/${Math.round(1 / n)}`;
};

const formatFocal = (n) =>
  typeof n === 'number' ? `${Math.round(n)}mm` : undefined;

const mapExif = (image_metadata = {}) => {
  const camera = [image_metadata.Make, image_metadata.Model]
    .filter(Boolean)
    .join(' ')
    .trim();
  return {
    camera: camera || undefined,
    lens: image_metadata.LensModel || undefined,
    iso:
      typeof image_metadata.ISO === 'number' ? image_metadata.ISO : undefined,
    aperture: formatAperture(image_metadata.FNumber),
    shutter: formatShutter(image_metadata.ExposureTime),
    focalLength: formatFocal(image_metadata.FocalLength),
    dateTaken: image_metadata.DateTimeOriginal
      ? new Date(image_metadata.DateTimeOriginal).toISOString()
      : undefined,
  };
};

const fetchExif = async (publicId) => {
  try {
    const res = await cloudinary.v2.api.resource(publicId, {
      image_metadata: true,
    });
    return mapExif(res.image_metadata);
  } catch (err) {
    console.warn(`sync-exif: failed to fetch ${publicId}: ${err.message}`);
    return null;
  }
};

const loadCache = async () => {
  if (!existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(await readFile(CACHE_FILE, 'utf-8'));
  } catch {
    return {};
  }
};

const collectCldPaths = async () => {
  if (!existsSync(ROLLS_DIR)) return [];
  const files = (await readdir(ROLLS_DIR)).filter((f) => f.endsWith('.json'));
  const paths = new Set();
  for (const file of files) {
    const roll = JSON.parse(await readFile(join(ROLLS_DIR, file), 'utf-8'));
    for (const photo of roll.photos ?? []) {
      if (photo.cldPath) paths.add(photo.cldPath);
    }
    if (roll.cover?.cldPath) paths.add(roll.cover.cldPath);
  }
  return [...paths];
};

const cache = await loadCache();
const allPaths = await collectCldPaths();
const missing = allPaths.filter((p) => !cache[p]);

if (missing.length === 0) {
  console.log(
    `sync-exif: cache up to date (${allPaths.length} photo${allPaths.length === 1 ? '' : 's'} cached)`,
  );
  process.exit(0);
}

console.log(`sync-exif: fetching EXIF for ${missing.length} new photo(s)...`);

for (const publicId of missing) {
  const exif = await fetchExif(publicId);
  if (exif) cache[publicId] = exif;
}

await mkdir(CACHE_DIR, { recursive: true });
await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2) + '\n');

console.log(
  `sync-exif: wrote cache for ${Object.keys(cache).length} photo(s) → ${CACHE_FILE}`,
);
