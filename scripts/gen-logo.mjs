/**
 * Generate src/components/sig-paths.ts — exact "JON WOLF" letter outlines
 * (Rockstar-Regular) + underline swash (Rockstarswashes glyph #38),
 * simplified for header scale: integer precision, brush speckles smaller
 * than a few units dropped (sub-pixel at 44px render height).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import opentype from 'opentype.js';

const FONTS = 'C:/Users/drfre/Desktop/Rockstar Fonts/';
const toBuf = (f) => readFileSync(FONTS + f).buffer;

const rockstar = opentype.parse(toBuf('Rockstar-Regular.otf'));
const swashes = opentype.parse(toBuf('Rockstarswashes-Regular.otf'));

const TEXT = 'JON WOLF';
const SIZE = 96;
const X = 4;
const Y = 100;

/** Flatten path commands into polygon subpaths, drop specks, RDP-simplify, emit compact data. */
function simplify(path, minSpan = 4, epsilon = 0.7) {
  // split into subpaths
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
      if (c.type === 'M') {
        pos = [c.x, c.y];
        pts.push(pos);
      } else if (c.type === 'L') {
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
    const left = rdp(pts.slice(0, idx + 1), eps);
    const right = rdp(pts.slice(idx), eps);
    return left.slice(0, -1).concat(right);
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
    // Closed loop: a==b degenerates the RDP baseline — split at the point
    // farthest from the start and simplify the two open halves.
    let simp;
    const closed =
      Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < 0.01;
    if (closed && pts.length > 3) {
      let far = 1;
      let best = 0;
      for (let i = 1; i < pts.length; i++) {
        const d = Math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]);
        if (d > best) {
          best = d;
          far = i;
        }
      }
      const h1 = rdp(pts.slice(0, far + 1), epsilon);
      const h2 = rdp(pts.slice(far), epsilon);
      simp = h1.slice(0, -1).concat(h2);
    } else {
      simp = rdp(pts, epsilon);
    }
    d += `M${Math.round(simp[0][0])} ${Math.round(simp[0][1])}`;
    for (let i = 1; i < simp.length; i++) {
      d += `L${Math.round(simp[i][0])} ${Math.round(simp[i][1])}`;
    }
    d += 'Z';
  }
  return { d, kept, dropped };
}

// ---- Letters ----
const letters = [];
rockstar.forEachGlyph(TEXT, X, Y, SIZE, { kerning: true }, (glyph, gx, gy, gsize) => {
  const p = glyph.getPath(gx, gy, gsize);
  if (!p.commands.length) return; // space
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
  console.log(`${String.fromCharCode(glyph.unicode)} kept ${s.kept} dropped ${s.dropped} len ${s.d.length}`);
});

// ---- Swash: glyph #38, scaled to span the wordmark width ----
const sw = swashes.glyphs.get(38);
const probe = sw.getPath(0, 0, 96).getBoundingBox();
const targetW = 348;
const scale = targetW / (probe.x2 - probe.x1);
const size = 96 * scale;
const p0 = sw.getPath(0, 0, size).getBoundingBox();
// place: left edge x=8, vertical center y=126
const sx = 8 - p0.x1;
const sy = 126 - (p0.y1 + p0.y2) / 2;
const swashPath = sw.getPath(sx, sy, size);
const sb = swashPath.getBoundingBox();
const ss = simplify(swashPath, 5);
console.log(`swash kept ${ss.kept} dropped ${ss.dropped} len ${ss.d.length} bbox ${JSON.stringify(sb)}`);

const out = `// AUTO-GENERATED by scripts/gen-logo.mjs — do not hand-edit.
// "JON WOLF" outlines from Rockstar-Regular, swash from Rockstarswashes-Regular (glyph 38).

export interface SigLetter {
  char: string;
  d: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const VIEWBOX = '0 0 368 146';

export const LETTERS: SigLetter[] = ${JSON.stringify(letters)};

export const SWASH = {
  d: ${JSON.stringify(ss.d)},
  x1: ${+sb.x1.toFixed(1)},
  y1: ${+sb.y1.toFixed(1)},
  x2: ${+sb.x2.toFixed(1)},
  y2: ${+sb.y2.toFixed(1)},
};

/** Pen spine for the swash mask stroke — follows the swash's arc. */
export const SWASH_SPINE = 'M ${(sb.x1 + 2).toFixed(0)} ${((sb.y1 + sb.y2) / 2 + 3).toFixed(0)} C 110 ${(sb.y1 + 1).toFixed(0)}, 240 ${(sb.y1 + 1).toFixed(0)}, ${(sb.x2 - 3).toFixed(0)} ${((sb.y1 + sb.y2) / 2 - 1).toFixed(0)}';
`;

writeFileSync('src/components/sig-paths.ts', out);
console.log('total ts size:', out.length, 'bytes → src/components/sig-paths.ts');
