/**
 * 墨のにじみを、ビルド時に形へ焼き込む。
 *
 * 以前は feTurbulence + feDisplacementMap の SVG フィルタで枝や花の縁を
 * 荒らしていた。ブラウザは絵が少し変わるたびにこのフィルタを丸ごと
 * 計算し直すため、開幕の描画や花の発光と重なって描画が詰まっていた。
 *
 * ここでは同じノイズ（SVG 仕様の参照実装）で同じずらしを計算し、
 * ずれた後の輪郭をただのパスとして書き出す。見た目はフィルタと同じで、
 * ブラウザ側のフィルタ処理はなくなる。
 */

export type Point = [number, number];
/** 正なら形の内側。0 の等高線が輪郭になる */
export type Field = (x: number, y: number) => number;
export interface Box { x0: number; y0: number; x1: number; y1: number }

/* ---------- feTurbulence（fractalNoise）のアルファ ---------- */

export interface InkSpec {
  seed: number;
  baseFrequency: number | readonly [number, number];
  numOctaves: number;
  /** feDisplacementMap の scale */
  scale: number;
}

const B_SIZE = 0x100;
const B_MASK = 0xff;
const PERLIN_N = 0x1000;
const RAND_M = 2147483647;
const RAND_A = 16807;
const RAND_Q = 127773;
const RAND_R = 2836;

/**
 * feDisplacementMap が各点をどれだけずらすかを返す。
 * チャンネル指定の既定はどちらも A なので、x と y に同じ量がかかる。
 * 出力の点 P は入力の P + d(P) を写す。
 */
export function displacement(spec: InkSpec): (x: number, y: number) => number {
  const [fx, fy] = typeof spec.baseFrequency === 'number'
    ? [spec.baseFrequency, spec.baseFrequency]
    : spec.baseFrequency;

  let seed = Math.round(spec.seed);
  if (seed <= 0) seed = -(seed % (RAND_M - 1)) + 1;
  if (seed > RAND_M - 1) seed = RAND_M - 1;
  const random = () => {
    seed = RAND_A * (seed % RAND_Q) - RAND_R * Math.floor(seed / RAND_Q);
    if (seed <= 0) seed += RAND_M;
    return seed;
  };

  const size = B_SIZE + B_SIZE + 2;
  const lattice = new Int32Array(size);
  const gradient = Array.from({ length: 4 }, () => new Float64Array(size * 2));
  for (let k = 0; k < 4; k++) {
    for (let i = 0; i < B_SIZE; i++) {
      lattice[i] = i;
      const gx = ((random() % (B_SIZE + B_SIZE)) - B_SIZE) / B_SIZE;
      const gy = ((random() % (B_SIZE + B_SIZE)) - B_SIZE) / B_SIZE;
      const len = Math.hypot(gx, gy) || 1;
      gradient[k][i * 2] = gx / len;
      gradient[k][i * 2 + 1] = gy / len;
    }
  }
  for (let i = B_SIZE - 1; i > 0; i--) {
    const k = lattice[i];
    const j = random() % B_SIZE;
    lattice[i] = lattice[j];
    lattice[j] = k;
  }
  for (let i = 0; i < B_SIZE + 2; i++) {
    lattice[B_SIZE + i] = lattice[i];
    for (let k = 0; k < 4; k++) {
      gradient[k][(B_SIZE + i) * 2] = gradient[k][i * 2];
      gradient[k][(B_SIZE + i) * 2 + 1] = gradient[k][i * 2 + 1];
    }
  }

  const g = gradient[3]; // アルファのチャンネル
  const noise2 = (vx: number, vy: number) => {
    let t = vx + PERLIN_N;
    const bx0 = (t | 0) & B_MASK;
    const bx1 = (bx0 + 1) & B_MASK;
    const rx0 = t - (t | 0);
    const rx1 = rx0 - 1;
    t = vy + PERLIN_N;
    const by0 = (t | 0) & B_MASK;
    const by1 = (by0 + 1) & B_MASK;
    const ry0 = t - (t | 0);
    const ry1 = ry0 - 1;
    const i = lattice[bx0];
    const j = lattice[bx1];
    const b00 = lattice[i + by0] * 2;
    const b10 = lattice[j + by0] * 2;
    const b01 = lattice[i + by1] * 2;
    const b11 = lattice[j + by1] * 2;
    const sx = rx0 * rx0 * (3 - 2 * rx0);
    const sy = ry0 * ry0 * (3 - 2 * ry0);
    let u = rx0 * g[b00] + ry0 * g[b00 + 1];
    let v = rx1 * g[b10] + ry0 * g[b10 + 1];
    const a = u + sx * (v - u);
    u = rx0 * g[b01] + ry1 * g[b01 + 1];
    v = rx1 * g[b11] + ry1 * g[b11 + 1];
    const b = u + sx * (v - u);
    return a + sy * (b - a);
  };

  const { numOctaves, scale } = spec;
  return (x, y) => {
    let sum = 0;
    let vx = x * fx;
    let vy = y * fy;
    let ratio = 1;
    for (let o = 0; o < numOctaves; o++) {
      sum += noise2(vx, vy) / ratio;
      vx *= 2;
      vy *= 2;
      ratio *= 2;
    }
    const alpha = Math.min(1, Math.max(0, (sum + 1) / 2));
    return scale * (alpha - 0.5);
  };
}

/** ずらしの最大量（x と y に同じ量がかかるので斜めに √2 倍） */
export const maxShift = (spec: Pick<InkSpec, 'scale'>) => (spec.scale / 2) * Math.SQRT2;

/* ---------- パス ---------- */

/** M / L / C / Z（絶対座標）だけのパスを折れ線にする */
export function flattenPath(d: string, step: number): Point[][] {
  const tokens = d.match(/[MLCZ]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? [];
  const lines: Point[][] = [];
  let line: Point[] = [];
  let cmd = '';
  let k = 0;
  const num = () => Number(tokens[k++]);
  while (k < tokens.length) {
    if (/^[a-z]$/i.test(tokens[k])) cmd = tokens[k++];
    if (/[a-z]/.test(cmd)) throw new Error(`相対座標のパスには対応していません: ${cmd}`);
    if (cmd === 'M') {
      if (line.length) lines.push(line);
      line = [[num(), num()]];
      cmd = 'L';
    } else if (cmd === 'L') {
      line.push([num(), num()]);
    } else if (cmd === 'C') {
      const p0 = line[line.length - 1];
      const p1: Point = [num(), num()];
      const p2: Point = [num(), num()];
      const p3: Point = [num(), num()];
      const approx = dist(p0, p1) + dist(p1, p2) + dist(p2, p3);
      const n = Math.max(2, Math.ceil(approx / step));
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        const mt = 1 - t;
        const a = mt * mt * mt, b = 3 * mt * mt * t, c = 3 * mt * t * t, e = t * t * t;
        line.push([
          a * p0[0] + b * p1[0] + c * p2[0] + e * p3[0],
          a * p0[1] + b * p1[1] + c * p2[1] + e * p3[1],
        ]);
      }
    } else if (cmd === 'Z') {
      const first = line[0];
      const last = line[line.length - 1];
      if (dist(first, last) < 1e-9) line.pop();
      lines.push(line);
      line = [];
    } else {
      throw new Error(`未対応のパス命令です: ${cmd}`);
    }
  }
  if (line.length) lines.push(line);
  return lines;
}

const dist = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);

function segmentDist2(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const ex = ax + t * dx - px;
  const ey = ay + t * dy - py;
  return ex * ex + ey * ey;
}

export function boundsOf(points: Point[], pad = 0): Box {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of points) {
    if (x < x0) x0 = x;
    if (y < y0) y0 = y;
    if (x > x1) x1 = x;
    if (y > y1) y1 = y;
  }
  return { x0: x0 - pad, y0: y0 - pad, x1: x1 + pad, y1: y1 + pad };
}

/* ---------- 形の場 ---------- */

/** 丸い端・丸い角の線（stroke-linecap/linejoin: round）の内外 */
export function strokeField(line: Point[], width: number): Field {
  const half = width / 2;
  const reach = half + 2; // これより遠い点は「外」とだけ分かればよい
  const cell = Math.max(2, reach);
  const box = boundsOf(line, reach);
  const cols = Math.ceil((box.x1 - box.x0) / cell) + 1;
  const rows = Math.ceil((box.y1 - box.y0) / cell) + 1;
  const buckets: number[][] = Array.from({ length: cols * rows }, () => []);
  for (let s = 0; s < line.length - 1; s++) {
    const [ax, ay] = line[s];
    const [bx, by] = line[s + 1];
    const c0 = Math.floor((Math.min(ax, bx) - reach - box.x0) / cell);
    const c1 = Math.floor((Math.max(ax, bx) + reach - box.x0) / cell);
    const r0 = Math.floor((Math.min(ay, by) - reach - box.y0) / cell);
    const r1 = Math.floor((Math.max(ay, by) + reach - box.y0) / cell);
    for (let r = Math.max(0, r0); r <= Math.min(rows - 1, r1); r++) {
      for (let c = Math.max(0, c0); c <= Math.min(cols - 1, c1); c++) buckets[r * cols + c].push(s);
    }
  }
  return (x, y) => {
    const c = Math.floor((x - box.x0) / cell);
    const r = Math.floor((y - box.y0) / cell);
    if (c < 0 || r < 0 || c >= cols || r >= rows) return -reach;
    let best = reach * reach;
    for (const s of buckets[r * cols + c]) {
      const a = line[s];
      const b = line[s + 1];
      const d2 = segmentDist2(x, y, a[0], a[1], b[0], b[1]);
      if (d2 < best) best = d2;
    }
    return half - Math.sqrt(best);
  };
}

/**
 * 太さが芯に沿って変わる線（先細りの枝）。`halfAt` は芯の頂点ごとの半幅。
 * 丸い端・丸い角になるのは strokeField と同じ。
 */
export function taperedStrokeField(line: Point[], halfAt: number[]): Field {
  const maxHalf = Math.max(...halfAt);
  const reach = maxHalf + 2;
  const cell = Math.max(2, reach);
  const box = boundsOf(line, reach);
  const cols = Math.ceil((box.x1 - box.x0) / cell) + 1;
  const rows = Math.ceil((box.y1 - box.y0) / cell) + 1;
  const buckets: number[][] = Array.from({ length: cols * rows }, () => []);
  for (let s = 0; s < line.length - 1; s++) {
    const [ax, ay] = line[s];
    const [bx, by] = line[s + 1];
    const c0 = Math.floor((Math.min(ax, bx) - reach - box.x0) / cell);
    const c1 = Math.floor((Math.max(ax, bx) + reach - box.x0) / cell);
    const r0 = Math.floor((Math.min(ay, by) - reach - box.y0) / cell);
    const r1 = Math.floor((Math.max(ay, by) + reach - box.y0) / cell);
    for (let r = Math.max(0, r0); r <= Math.min(rows - 1, r1); r++) {
      for (let c = Math.max(0, c0); c <= Math.min(cols - 1, c1); c++) buckets[r * cols + c].push(s);
    }
  }
  return (x, y) => {
    const c = Math.floor((x - box.x0) / cell);
    const r = Math.floor((y - box.y0) / cell);
    if (c < 0 || r < 0 || c >= cols || r >= rows) return -reach;
    let best = -reach;
    for (const s of buckets[r * cols + c]) {
      const [ax, ay] = line[s];
      const [bx, by] = line[s + 1];
      const dx = bx - ax;
      const dy = by - ay;
      const len2 = dx * dx + dy * dy;
      let t = len2 ? ((x - ax) * dx + (y - ay) * dy) / len2 : 0;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const d = Math.hypot(ax + t * dx - x, ay + t * dy - y);
      const v = halfAt[s] + (halfAt[s + 1] - halfAt[s]) * t - d;
      if (v > best) best = v;
    }
    return best;
  };
}

/** 閉じた多角形の内外（符号付き距離） */
export function polygonField(poly: Point[]): Field {
  return (x, y) => {
    let best = Infinity;
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [ax, ay] = poly[j];
      const [bx, by] = poly[i];
      const d2 = segmentDist2(x, y, ax, ay, bx, by);
      if (d2 < best) best = d2;
      if ((ay > y) !== (by > y) && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
    }
    const d = Math.sqrt(best);
    return inside ? d : -d;
  };
}

/** 重い場を格子に写して、双線形補間で引けるようにする */
export function sampledField(field: Field, box: Box, res: number): Field {
  const nx = Math.ceil((box.x1 - box.x0) / res) + 1;
  const ny = Math.ceil((box.y1 - box.y0) / res) + 1;
  const v = new Float64Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) v[j * nx + i] = field(box.x0 + i * res, box.y0 + j * res);
  }
  return (x, y) => {
    const fx = (x - box.x0) / res;
    const fy = (y - box.y0) / res;
    if (fx < 0 || fy < 0 || fx >= nx - 1 || fy >= ny - 1) return -1;
    const i = fx | 0;
    const j = fy | 0;
    const tx = fx - i;
    const ty = fy - j;
    const k = j * nx + i;
    const top = v[k] + (v[k + 1] - v[k]) * tx;
    const bottom = v[k + nx] + (v[k + nx + 1] - v[k + nx]) * tx;
    return top + (bottom - top) * ty;
  };
}

/* ---------- 輪郭を取る（マーチングスクエア） ---------- */

export function traceContours(field: Field, box: Box, res: number): Point[][] {
  const { x0, y0 } = box;
  const nx = Math.ceil((box.x1 - x0) / res) + 1;
  const ny = Math.ceil((box.y1 - y0) / res) + 1;
  const v = new Float64Array(nx * ny);
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const edge = i === 0 || j === 0 || i === nx - 1 || j === ny - 1;
      const value = edge ? -1 : field(x0 + i * res, y0 + j * res);
      // ちょうど 0 だと交点が格子点に重なり向きが決まらないので、外へ倒す
      v[j * nx + i] = value === 0 ? -1e-9 : value;
    }
  }

  // 横の辺 (i,j)-(i+1,j) は 2k、縦の辺 (i,j)-(i,j+1) は 2k+1（k = j*nx+i）
  const cross = (id: number): Point => {
    const k = id >> 1;
    const i = k % nx;
    const j = (k - i) / nx;
    const a = v[k];
    const b = id & 1 ? v[k + nx] : v[k + 1];
    const t = a / (a - b);
    return id & 1 ? [x0 + i * res, y0 + (j + t) * res] : [x0 + (i + t) * res, y0 + j * res];
  };

  const next = new Map<number, number>();
  const link = (e1: number, e2: number, cx: number, cy: number, cornerInside: boolean) => {
    // 内側がいつも同じ側に来るよう向きをそろえる（角が内なら左、外なら右）
    const p = cross(e1);
    const q = cross(e2);
    const side = (q[0] - p[0]) * (cy - p[1]) - (q[1] - p[1]) * (cx - p[0]);
    if (side > 0 === cornerInside) next.set(e1, e2);
    else next.set(e2, e1);
  };

  for (let j = 0; j < ny - 1; j++) {
    for (let i = 0; i < nx - 1; i++) {
      const k = j * nx + i;
      const a = v[k] > 0, b = v[k + 1] > 0, c = v[k + nx + 1] > 0, d = v[k + nx] > 0;
      if (a === b && b === c && c === d) continue;
      const top = k * 2;
      const bottom = (k + nx) * 2;
      const left = k * 2 + 1;
      const right = (k + 1) * 2 + 1;
      const xl = x0 + i * res, xr = xl + res, yt = y0 + j * res, yb = yt + res;
      if (a === c && b === d) {
        // 鞍点。中央の値で、内側どうしがつながるかを決める
        const center = (v[k] + v[k + 1] + v[k + nx + 1] + v[k + nx]) / 4 > 0;
        if (center === a) {
          link(top, right, xr, yt, b);
          link(bottom, left, xl, yb, d);
        } else {
          link(top, left, xl, yt, a);
          link(right, bottom, xr, yb, c);
        }
        continue;
      }
      const edges: number[] = [];
      if (a !== b) edges.push(top);
      if (b !== c) edges.push(right);
      if (d !== c) edges.push(bottom);
      if (a !== d) edges.push(left);
      // 左上の角で向きを判定する（左上が辺の端でも内外は分かる）
      link(edges[0], edges[1], xl, yt, a);
    }
  }

  const rings: Point[][] = [];
  const seen = new Set<number>();
  for (const start of next.keys()) {
    if (seen.has(start)) continue;
    const ring: Point[] = [];
    let e: number | undefined = start;
    while (e !== undefined && !seen.has(e)) {
      seen.add(e);
      ring.push(cross(e));
      e = next.get(e);
    }
    if (ring.length > 2) rings.push(ring);
  }
  return rings;
}

/* ---------- 間引きと書き出し ---------- */

function ringArea(ring: Point[]) {
  let s = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    s += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return s / 2;
}

function simplifyLine(pts: Point[], tol: number): Point[] {
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  const tol2 = tol * tol;
  while (stack.length) {
    const [s, e] = stack.pop()!;
    let best = -1;
    let idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d2 = segmentDist2(pts[i][0], pts[i][1], pts[s][0], pts[s][1], pts[e][0], pts[e][1]);
      if (d2 > best) { best = d2; idx = i; }
    }
    if (best > tol2) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

export function simplifyRing(ring: Point[], tol: number): Point[] {
  if (ring.length < 6) return ring;
  let far = 0;
  let best = -1;
  for (let i = 1; i < ring.length; i++) {
    const d = dist(ring[0], ring[i]);
    if (d > best) { best = d; far = i; }
  }
  const a = simplifyLine(ring.slice(0, far + 1), tol);
  const b = simplifyLine([...ring.slice(far), ring[0]], tol);
  return [...a.slice(0, -1), ...b.slice(0, -1)];
}

/** 数値を短く書く（0.5 → .5、-0.5 → -.5） */
function num(n: number, digits: number) {
  const fixed = (Math.round(n * 10 ** digits) / 10 ** digits).toFixed(digits);
  const s = fixed.includes('.') ? fixed.replace(/\.?0+$/, '') : fixed;
  if (s === '-0') return '0';
  return s.replace(/^(-?)0\./, '$1.');
}

function join(nums: string[]) {
  let out = '';
  for (const n of nums) {
    if (!out) out = n;
    else if (n[0] === '-') out += n;
    else if (n[0] === '.' && /\.\d*$/.test(out)) out += n;
    else out += ' ' + n;
  }
  return out;
}

/** 輪郭を path の d にする。丸めた絶対座標どうしの差で書くので誤差はたまらない */
export function ringsToPath(rings: Point[][], digits = 1): string {
  const q = 10 ** digits;
  let d = '';
  for (const ring of rings) {
    const pts = ring.map(([x, y]) => [Math.round(x * q), Math.round(y * q)] as Point);
    const uniq = pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]);
    if (uniq.length < 3) continue;
    const [sx, sy] = uniq[0];
    d += 'M' + join([num(sx / q, digits), num(sy / q, digits)]);
    const rel: string[] = [];
    for (let i = 1; i < uniq.length; i++) {
      rel.push(num((uniq[i][0] - uniq[i - 1][0]) / q, digits), num((uniq[i][1] - uniq[i - 1][1]) / q, digits));
    }
    if (rel.length) d += 'l' + join(rel);
    d += 'z';
  }
  return d;
}

/* ---------- まとめ ---------- */

export interface BakeOptions {
  /** 輪郭を取る格子の細かさ（ユーザー単位） */
  res: number;
  /** 間引きの許容誤差 */
  tolerance: number;
  /** これより小さい欠片は捨てる */
  minArea: number;
  digits?: number;
}

/**
 * 形 `field` をずらし `shift` で荒らした輪郭を返す。
 * 出力の点 P は入力の P + shift(P) を写す（feDisplacementMap と同じ向き）。
 */
export function bake(field: Field, box: Box, shift: (x: number, y: number) => number, opts: BakeOptions): string {
  const displaced: Field = (x, y) => {
    const s = shift(x, y);
    return field(x + s, y + s);
  };
  const rings = traceContours(displaced, box, opts.res)
    .filter((r) => Math.abs(ringArea(r)) >= opts.minArea)
    .map((r) => simplifyRing(r, opts.tolerance));
  return ringsToPath(rings, opts.digits ?? 1);
}

/**
 * 線を、ずらした後の塗りの輪郭にする。
 * `endWidth` を渡すと、始点の `width` から終点へ向けて太さが変わる（筆の入りと抜き）。
 * 細り方は sakura-art.ts の widthAt と同じ式にしてある。
 */
export function bakeStroke(
  d: string,
  width: number,
  spec: InkSpec,
  opts: BakeOptions,
  endWidth = width,
  /** true ならまっすぐ細らせる（幹を何本かの線でつなぐとき、継ぎ目で太さが合う） */
  linear = false,
): string {
  const widest = Math.max(width, endWidth);
  // 太い線ほど芯の折れ線は粗くてよい（曲がりが緩いので誤差は出ない）
  const line = flattenPath(d, Math.min(4, Math.max(0.4, widest / 8)))[0];
  const box = boundsOf(line, widest / 2 + maxShift(spec) + opts.res * 2);
  if (endWidth === width) return bake(strokeField(line, width), box, displacement(spec), opts);
  const along = lengthsAlong(line);
  const total = along[along.length - 1] || 1;
  const halfAt = along.map((l) => (width + (endWidth - width) * (linear ? l / total : easeTaper(l / total))) / 2);
  return bake(taperedStrokeField(line, halfAt), box, displacement(spec), opts);
}

/** 筆の抜き。はじめはゆっくり、終わりへ向けて早く細る */
const easeTaper = (t: number) => t * t * (0.55 + 0.45 * t);

/** 折れ線の各頂点までの道のり */
export function lengthsAlong(line: Point[]): number[] {
  const out = [0];
  for (let i = 1; i < line.length; i++) out.push(out[i - 1] + dist(line[i - 1], line[i]));
  return out;
}

/** 点 c がずらした後にどこへ写るか（P + shift(P) = c を解く） */
export function shiftPoint(c: Point, shift: (x: number, y: number) => number): Point {
  let p: Point = [c[0], c[1]];
  for (let i = 0; i < 8; i++) {
    const s = shift(p[0], p[1]);
    p = [c[0] - s, c[1] - s];
  }
  return p;
}
