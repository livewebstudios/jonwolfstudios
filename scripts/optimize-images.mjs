/**
 * LWS image optimization pass.
 * assets_raw/*.png  →  public/images/atmos/*.jpg
 * Max 1600px wide, JPG q82 (mozjpeg), metadata stripped.
 * Prints a before/after size report.
 */
import sharp from 'sharp';
import { readdir, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';

const SRC = 'assets_raw';
const OUT = 'public/images/atmos';

await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => /\.(png|jpe?g|webp)$/i.test(f));
let totalBefore = 0;
let totalAfter = 0;

console.log('FILE'.padEnd(28) + 'BEFORE'.padStart(10) + 'AFTER'.padStart(10) + 'SAVED'.padStart(9));
console.log('-'.repeat(57));

for (const file of files) {
  const srcPath = path.join(SRC, file);
  const outPath = path.join(OUT, file.replace(/\.\w+$/, '.jpg'));
  const before = (await stat(srcPath)).size;

  await sharp(srcPath)
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(outPath); // sharp strips metadata unless asked to keep it

  const after = (await stat(outPath)).size;
  totalBefore += before;
  totalAfter += after;

  const mb = (n) => (n / 1024 / 1024).toFixed(2) + 'MB';
  const pct = (100 - (after / before) * 100).toFixed(0) + '%';
  console.log(file.padEnd(28) + mb(before).padStart(10) + mb(after).padStart(10) + pct.padStart(9));
}

const mb = (n) => (n / 1024 / 1024).toFixed(2) + 'MB';
console.log('-'.repeat(57));
console.log(
  'TOTAL'.padEnd(28) +
    mb(totalBefore).padStart(10) +
    mb(totalAfter).padStart(10) +
    ((100 - (totalAfter / totalBefore) * 100).toFixed(0) + '%').padStart(9)
);
