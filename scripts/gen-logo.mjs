/**
 * Generate src/components/sig-paths.ts — exact "JON WOLF" letter outlines
 * (Rockstar-Regular) + a single underline swash (Rockstarswashes), positioned
 * as ONE clean stroke clearly below the letters (matching Jon's reference).
 *
 * Also writes scripts/swash-compare.svg: JON WOLF with several candidate
 * swash glyphs underneath, so the closest match can be eyeballed.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import opentype from 'opentype.js';

// Rockstar fonts are user-installed; resolve from the per-user Fonts dir.
const FONTS = process.env.LOCALAPPDATA + '/Microsoft/Windows/Fonts/';
const toBuf = (f) => readFileSync(FONTS + f).buffer;

const rockstar = opentype.parse(toBuf('Rockstar-Regular.otf'));
const swashes = opentype.parse(toBuf('Rockstarswashes-Regular.otf'));

const TEXT = 'JON WOLF';
const SIZE = 96;
const X = 4;
const Y = 100;

// Layout
const SWASH_CENTER_Y = 130;
const SWASH_LEFT_X = 6;
const SWASH_WIDTH = 356;
const VB_W = 372;
const VB_H = 166;

// Which swash glyph reads closest to Jon's reference (thick rounded left,
// gentle arch, single continuous taper, speckled tail with a fleck at the
// end). Glyph 15 — glyph 38 broke in the middle and read as two strokes.
const CHOSEN_GLYPH = 15;

/** Flatten path commands into polygons, drop specks, RDP-simplify, emit compact data. */
function simplify(path, minSpan = 4, epsilon = 0.7) {
  const subs = [];
  let cur = [];
  for (const c of path.commands) {
    if (c.type === 'M' && cur.length) {
      subs.push(cur);
      cur = [];
    }
    cur.push(c);
  }
  if (cur.length) subs.push(cur);

  const bezier = (p, t) => {
    const u = 1 - t;
    if (p.length === 4) {
      return [
        u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
        u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1],
      ];
    }
    return [
      u * u * p[0][0] + 2 * u * t * p[1][0] + t * t * p[2][0],
      u * u * p[0][1] + 2 * u * t * p[1][1] + t * t * p[2][1],
    ];
  };

  const flatten = (sub) => {
    const pts = [];
    let pos = [0, 0];
    for (const c of sub) {
      if (c.type === 'M' || c.type === 'L') {
        pos = [c.x, c.y];
        pts.push(pos);
      } else if (c.type === 'C' || c.type === 'Q') {
        const ctrl =
          c.type === 'C'
            ? [pos, [c.x1, c.y1], [c.x2, c.y2], [c.x, c.y]]
            : [pos, [c.x1, c.y1], [c.x, c.y]];
        const span = Math.hypot(c.x - pos[0], c.y - pos[1]) + 2;
        const n = Math.max(2, Math.min(24, Math.ceil(span / 1.5)));
        for (let i = 1; i <= n; i++) pts.push(bezier(ctrl, i / n));
        pos = [c.x, c.y];
      }
    }
    return pts;
  };

  const rdp = (pts, eps) => {
    if (pts.length < 3) return pts;
    const [a, b] = [pts[0], pts[pts.length - 1]];
    let maxD = 0;
    let idx = 0;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1e-9;
    for (let i = 1; i < pts.length - 1; i++) {
      const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / len;
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD <= eps) return [a, b];
    return rdp(pts.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(pts.slice(idx), eps));
  };

  let kept = 0;
  let dropped = 0;
  let d = '';
  for (const sub of subs) {
    const pts = flatten(sub);
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [px, py] of pts) {
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
    if (maxX - minX < minSpan && maxY - minY < minSpan) {
      dropped++;
      continue;
    }
    kept++;
    const closed = Math.hypot(pts[0][0] - pts.at(-1)[0], pts[0][1] - pts.at(-1)[1]) < 0.01;
    let simp;
    if (closed && pts.length > 3) {
      let far = 1;
      let best = 0;
      for (let i = 1; i < pts.length; i++) {
        const dd = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]);
        if (dd > best) {
          best = dd;
          far = i;
        }
      }
      simp = rdp(pts.slice(0, far + 1), epsilon).slice(0, -1).concat(rdp(pts.slice(far), epsilon));
    } else {
      simp = rdp(pts, epsilon);
    }
    d += `M${Math.round(simp[0][0])} ${Math.round(simp[0][1])}`;
    for (let i = 1; i < simp.length; i++) d += `L${Math.round(simp[i][0])} ${Math.round(simp[i][1])}`;
    d += 'Z';
  }
  return { d, kept, dropped };
}

// ---- Letters ----
const letters = [];
rockstar.forEachGlyph(TEXT, X, Y, SIZE, { kerning: true }, (glyph, gx, gy, gsize) => {
  const p = glyph.getPath(gx, gy, gsize);
  if (!p.commands.length) return;
  const b = p.getBoundingBox();
  const s = simplify(p);
  letters.push({
    char: String.fromCharCode(glyph.unicode ?? 63),
    d: s.d,
    x1: +b.x1.toFixed(1),
    y1: +b.y1.toFixed(1),
    x2: +b.x2.toFixed(1),
    y2: +b.y2.toFixed(1),
  });
});

/** Build a swash path for a given glyph index, scaled+placed as the underline. */
function buildSwash(glyphIndex) {
  const g = swashes.glyphs.get(glyphIndex);
  const probe = g.getPath(0, 0, 96).getBoundingBox();
  const scale = SWASH_WIDTH / (probe.x2 - probe.x1);
  const size = 96 * scale;
  const p0 = g.getPath(0, 0, size).getBoundingBox();
  const sx = SWASH_LEFT_X - p0.x1;
  const sy = SWASH_CENTER_Y - (p0.y1 + p0.y2) / 2;
  const path = g.getPath(sx, sy, size);
  const b = path.getBoundingBox();
  const s = simplify(path, 5);
  return { d: s.d, x1: +b.x1.toFixed(1), y1: +b.y1.toFixed(1), x2: +b.x2.toFixed(1), y2: +b.y2.toFixed(1) };
}

// ---- Compare sheet ----
const CANDIDATES = [13, 15, 24, 25, 38, 40];
const wordPath = rockstar.getPath(TEXT, X, Y, SIZE, { kerning: true }).toPathData(1);
const compareRows = CANDIDATES.map((gi, row) => {
  const sw = buildSwash(gi);
  const yOff = row * 180;
  return `<g transform="translate(0 ${yOff})">
    <path d="${wordPath}" fill="#EDE7DC"/>
    <path d="${sw.d}" fill="#F2A33C"/>
    <text x="${VB_W + 14}" y="100" font-family="monospace" font-size="20" fill="#888">glyph ${gi}</text>
  </g>`;
}).join('\n');
writeFileSync(
  'scripts/swash-compare.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W + 140} ${CANDIDATES.length * 180}" style="background:#14121A">${compareRows}</svg>`
);

// ---- Final swash + module ----
const swash = buildSwash(CHOSEN_GLYPH);
const cy = (swash.y1 + swash.y2) / 2;
// Spine tracks the swash centerline with a faint upward bow; the wide mask
// stroke around it sweeps the whole brushstroke into view left-to-right.
const spine = `M ${Math.round(swash.x1 + 2)} ${Math.round(cy + 4)} C 120 ${Math.round(cy - 6)}, 250 ${Math.round(cy - 6)}, ${Math.round(swash.x2 - 3)} ${Math.round(cy - 2)}`;

const out = `// AUTO-GENERATED by scripts/gen-logo.mjs — do not hand-edit.
// "JON WOLF" outlines from Rockstar-Regular; underline swash from
// Rockstarswashes-Regular (glyph ${CHOSEN_GLYPH}), placed as a single stroke below the word.

export interface SigLetter {
  char: string;
  d: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const VIEWBOX = '0 0 ${VB_W} ${VB_H}';

export const LETTERS: SigLetter[] = ${JSON.stringify(letters)};

export const SWASH = ${JSON.stringify(swash)};

/** Pen spine for the swash reveal mask — follows the swash's arc. */
export const SWASH_SPINE = ${JSON.stringify(spine)};
`;

writeFileSync('src/components/sig-paths.ts', out);
console.log('letters:', letters.map((l) => l.char).join(''));
console.log('swash bbox:', JSON.stringify(swash));
console.log('wrote sig-paths.ts and swash-compare.svg');
