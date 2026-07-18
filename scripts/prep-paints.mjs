#!/usr/bin/env node
/**
 * Batch prep + upload for a painting album.
 *
 * Reads JPEGs from a local folder, resizes each to web spec (2000 px
 * long edge, JPEG q=80), uploads to Cloudinary at paints/<id>, and
 * writes (or appends to) the album JSON for Sveltia to pick up.
 *
 * Each painting's id — and its URL, /paints/<album>/<id> — is derived
 * from the FILENAME (slugified). Name files meaningfully before
 * running (e.g. "boy with woodcock.jpg" → paints/boy-with-woodcock);
 * ids must never change after publishing.
 *
 * Unlike rolls, an existing album is APPENDED to, not refused —
 * albums grow over time. --force overwrites Cloudinary assets and
 * replaces same-id entries in the JSON.
 *
 * Usage:
 *   pnpm prep-paints <album-slug> <folder-path> [--force]
 *
 * Examples:
 *   pnpm prep-paints my-early-paintings "/mnt/c/Users/Ercan/Pictures/paintings"
 *
 * Env vars (loaded by `node --env-file=.env.local` in the npm script):
 *   PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * After running:
 *   1. git commit + push src/content/paintings/<album>.json
 *   2. Open /photojockeysblog/ → Painting Albums → fill titles/years/
 *      medium/alts → Save & Publish (drag to reorder — array order is
 *      display + prev/next order; first painting is the default cover)
 */
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import sharp from 'sharp';
import cloudinary from 'cloudinary';

const PAINTINGS_DIR = 'src/content/paintings';

const args = process.argv.slice(2);
const force = args.includes('--force');
const positional = args.filter((a) => !a.startsWith('--'));
const [slug, folderArg] = positional;

const usage = () => {
  console.error(
    'Usage: pnpm prep-paints <album-slug> <folder-path> [--force]\n' +
      '  <album-slug>  lowercase letters, digits, hyphens (e.g. my-early-paintings)\n' +
      '  <folder-path> absolute or relative path to a folder of JPEGs\n' +
      '  --force       overwrite existing Cloudinary assets and same-id entries',
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

// "Boy with Woodcock (2023).jpg" → "boy-with-woodcock-2023"
const slugify = (filename) =>
  filename
    .replace(/\.(jpe?g)$/i, '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

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

// Filename-derived ids must be valid and unique before any upload.
const ids = jpegs.map(slugify);
const badId = jpegs.find((f, i) => !ids[i]);
if (badId) {
  console.error(`Filename "${badId}" slugifies to an empty id. Rename it.`);
  process.exit(1);
}
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dupes.length) {
  console.error(
    `Duplicate id(s) after slugifying filenames: ${[...new Set(dupes)].join(', ')}. Rename the files.`,
  );
  process.exit(1);
}

const albumJsonPath = join(PAINTINGS_DIR, `${slug}.json`);
let album = null;
if (existsSync(albumJsonPath)) {
  album = JSON.parse(await readFile(albumJsonPath, 'utf8'));
  const existing = new Set(album.paintings.map((p) => p.id));
  const collisions = ids.filter((id) => existing.has(id));
  if (collisions.length && !force) {
    console.error(
      `Album ${slug} already contains: ${collisions.join(', ')}.\n` +
        'Rename the files, or re-run with --force to replace those entries.',
    );
    process.exit(1);
  }
  console.log(
    `Appending ${jpegs.length} painting(s) to existing album ${albumJsonPath}...`,
  );
} else {
  console.log(
    `Creating new draft album ${albumJsonPath} with ${jpegs.length} painting(s)...`,
  );
}

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

const uploaded = [];
for (let i = 0; i < jpegs.length; i++) {
  const filename = jpegs[i];
  const id = ids[i];
  const publicId = `paints/${id}`;

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

    uploaded.push({
      id,
      title: '',
      year: '',
      medium: '',
      subjects: [],
      image: { cldPath: publicId, alt: '' },
      tags: [],
    });
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

if (album) {
  const byId = new Map(uploaded.map((p) => [p.id, p]));
  // --force replaces same-id entries in place (keeps their position).
  album.paintings = album.paintings.map((p) => byId.get(p.id) ?? p);
  const existing = new Set(album.paintings.map((p) => p.id));
  album.paintings.push(...uploaded.filter((p) => !existing.has(p.id)));
} else {
  album = {
    title: '',
    years: '',
    paintings: uploaded,
    draft: true,
  };
}

await writeFile(albumJsonPath, JSON.stringify(album, null, 2) + '\n');

console.log(
  `\nWrote ${album.paintings.length} painting(s) to ${albumJsonPath}${album.draft ? ' (draft)' : ''}.\n` +
    `Next: commit + push the JSON, then open /photojockeysblog/ → Painting Albums → ${slug}\n` +
    `      to fill titles/years/medium/alts and publish.`,
);
