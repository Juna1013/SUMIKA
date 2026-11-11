/**
 * 桜を、ビルド時に描き上げる。
 *
 * 枝は墨のにじみを形に焼き込み、筆の入りと抜き（先細り）、樹皮の横縞、
 * 上からの光を重ねる。花は一輪ずつ形の違う型をいくつか作り、
 * 正面・横顔・蕾を、枝から伸びる花柄（かへい）の先に咲かせる。
 * 舞う花びらの乱数もここで決めるので、ブラウザは出来上がった絵を
 * 順に見せるだけになる（SVG フィルタは使わない）。
 * 結果はモジュールの読み込み時に一度だけ計算する。
 */
import {
  blossoms,
  branches,
  fallingPetalCount,
  inkRough,
  inkRoughFine,
  moss,
  sprigs,
  type BlossomKind,
  type Branch,
} from '../data/sakura';
import {
  bakeStroke,
  displacement,
  flattenPath,
  lengthsAlong,
  maxShift,
  shiftPoint,
  type InkSpec,
  type Point,
} from './ink';

/** 毎回同じ絵になるよう、乱数は種から作る（mulberry32） */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type Random = () => number;

const round = (n: number, digits = 1) => Math.round(n * 10 ** digits) / 10 ** digits;
/** パス用に短く書く（小数 2 桁） */
const f = (n: number) => String(round(n, 2));
const pt = ([x, y]: Point) => `${f(x)} ${f(y)}`;
const between = (rand: Random, a: number, b: number) => a + rand() * (b - a);
const RAD = Math.PI / 180;

/* ====================================================================
   枝
   ==================================================================== */

const endWidth = (b: Branch) => b.end ?? b.width * 0.4;
/** 幹（太さを指定した線）はまっすぐ細らせ、小枝は筆を抜くように細らせる */
const widthAt = (b: Branch, t: number) =>
  b.width + (endWidth(b) - b.width) * (b.end === undefined ? t * t * (0.55 + 0.45 * t) : t);

/**
 * 描き順はマスクの線で見せる。荒れて外へ広がった縁まで覆えるよう、
 * ずらしの最大量の分だけ太くする（細いと縁が欠けたまま残る）。
 */
const revealWidth = (width: number, spec: { scale: number }) => round(width + 2 * maxShift(spec) + 0.6);

/** にじみでずれた後の芯。花柄の付け根や樹皮の模様はこの上に置く */
interface Spine {
  points: Point[];
  /** 各点の法線（上向き） */
  normals: Point[];
  /** 各点での枝の太さ */
  widths: number[];
  /** 各点までの道のりの割合 0〜1 */
  along: number[];
  branch: Branch;
}

function spineOf(b: Branch, spec: InkSpec, step: number): Spine {
  const shift = displacement(spec);
  const raw = flattenPath(b.d, step)[0];
  const lengths = lengthsAlong(raw);
  const total = lengths[lengths.length - 1] || 1;
  const along = lengths.map((l) => l / total);
  const points = raw.map((p) => shiftPoint(p, shift));
  const normals = raw.map((_, i) => {
    const a = raw[Math.max(0, i - 1)];
    const c = raw[Math.min(raw.length - 1, i + 1)];
    const dx = c[0] - a[0];
    const dy = c[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    // 上（y が小さい側）を向く法線
    let n: Point = [dy / len, -dx / len];
    if (n[1] > 0) n = [-n[0], -n[1]];
    return n;
  });
  return { points, normals, widths: along.map((t) => widthAt(b, t)), along, branch: b };
}

/** 樹皮。上の縁に沿う光（かすれた線）と、桜の幹に特有の横縞 */
function barkOf(spine: Spine, rand: Random) {
  const { points, normals, widths, branch } = spine;
  if (branch.width < 4.5) return { light: '', lightWidth: 0, marks: '' };

  // 光: 芯から上へ寄せた細い線。ところどころ途切れさせて、かすれに見せる
  let light = '';
  let pen = false;
  let drawing = false;
  let run = 0;
  for (let i = 1; i < points.length - 1; i++) {
    if (run <= 0) {
      pen = !pen;
      drawing = false;
      run = pen ? between(rand, 9, 26) : between(rand, 1, 3);
    }
    run--;
    if (widths[i] < 3) break;
    if (!pen) continue;
    const off = widths[i] * 0.24;
    const p: Point = [points[i][0] + normals[i][0] * off, points[i][1] + normals[i][1] * off];
    light += (drawing ? 'L' : 'M') + pt(p);
    drawing = true;
  }

  // 横縞（皮目）: 枝を横切る短い線
  let marks = '';
  let next = between(rand, 4, 10);
  for (let i = 2; i < points.length - 2; i++) {
    if (--next > 0 || widths[i] < 4.5) continue;
    next = between(rand, 3, 9);
    const half = widths[i] / 2;
    const from = between(rand, -0.7, 0.1) * half;
    const to = from + between(rand, 0.35, 0.8) * half;
    const lean = between(rand, -0.8, 0.8);
    const [x, y] = points[i];
    const [nx, ny] = normals[i];
    marks += `M${pt([x + nx * from - ny * lean, y + ny * from + nx * lean])}L${pt([x + nx * to, y + ny * to])}`;
  }

  return { light, lightWidth: round(branch.width * 0.14), marks };
}

function inkBranch(b: Branch, spec: InkSpec, res: number, rand: Random) {
  const end = endWidth(b);
  const spine = spineOf(b, spec, 3);
  return {
    tone: b.tone,
    delay: b.delay,
    d: b.d,
    fill: bakeStroke(
      b.d, b.width, spec,
      { res, tolerance: res * 0.28, minArea: 0.15 },
      end,
      b.end !== undefined,
    ),
    revealWidth: revealWidth(Math.max(b.width, end), spec),
    bark: barkOf(spine, rand),
    spine,
  };
}

/* ====================================================================
   花の型
   ==================================================================== */

/**
 * 花びら一枚。付け根が原点で、先（切れ込みのある側）が上（-y）。
 * `tf` で花の中の位置へ写す。
 */
function petalPath(L: number, w: number, notch: number, lean: number, tf: (p: Point) => Point) {
  // lean は先へ行くほど横へ流す量（左右対称を崩す）
  const P = (x: number, y: number) => pt(tf([x * w + lean * (y * y), -y * L]));
  const tipY = 1 - notch / L;
  return (
    `M${P(0, 0)}` +
    `C${P(-0.22, 0.1)} ${P(-1.04, 0.36)} ${P(-1, 0.66)}` +
    `C${P(-0.97, 0.86)} ${P(-0.6, 1.01)} ${P(-0.22, 1)}` +
    `C${P(-0.12, 0.995)} ${P(-0.04, tipY + 0.05)} ${P(0, tipY)}` +
    `C${P(0.04, tipY + 0.05)} ${P(0.12, 0.995)} ${P(0.22, 1)}` +
    `C${P(0.6, 1.01)} ${P(0.97, 0.86)} ${P(1, 0.66)}` +
    `C${P(1.04, 0.36)} ${P(0.22, 0.1)} ${P(0, 0)}Z`
  );
}

const rotateBy = (deg: number, origin: Point = [0, 0]) => {
  const c = Math.cos(deg * RAD);
  const s = Math.sin(deg * RAD);
  return ([x, y]: Point): Point => [origin[0] + c * x - s * y, origin[1] + s * x + c * y];
};

/** 小さな円（葯）をまとめて一本のパスにする */
const dots = (centers: Point[], r: number) =>
  centers.map(([x, y]) => `M${f(x - r)} ${f(y)}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`).join('');

/** 正面を向いた花 */
function frontBlossom(rand: Random) {
  const turn = rand() * 72;
  const petals: string[] = [];
  let crease = '';
  let sepals = '';
  for (let p = 0; p < 5; p++) {
    const angle = turn + p * 72 + between(rand, -5, 5);
    const L = between(rand, 12, 13.6);
    const w = between(rand, 5.5, 6.5);
    const notch = between(rand, 1.2, 2.1);
    const tf = rotateBy(angle);
    petals.push(petalPath(L, w, notch, between(rand, -0.5, 0.5), (q) => tf([q[0], q[1] - 0.9])));
    // 花びらの中央を通る筋
    crease += `M${pt(tf([0, -3.4]))}L${pt(tf([between(rand, -0.3, 0.3), -(L - notch) + 0.4]))}`;
    // 花びらの間からのぞく萼（がく）
    const st = rotateBy(angle + 36);
    sepals += `M${pt(st([-1.25, -1]))}L${pt(st([0, -6.2]))}L${pt(st([1.25, -1]))}Z`;
  }

  // 蕊（しべ）: 長さの違う花糸と、その先の葯
  let stamens = '';
  const anthers: Point[] = [];
  const count = 15 + Math.floor(rand() * 5);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * 360 + between(rand, -9, 9);
    const len = between(rand, 2.6, 6.6);
    const tip = rotateBy(a)([0, -len]);
    const mid = rotateBy(a + between(rand, -14, 14))([0, -len * 0.55]);
    stamens += `M0 0Q${pt(mid)} ${pt(tip)}`;
    anthers.push(tip);
  }
  return { petals, crease, sepals, stamens, anthers: dots(anthers, 0.52) };
}

/** 横を向いた花。付け根（萼の根もと）が原点で、上（-y）へ開く */
function sideBlossom(rand: Random) {
  const base: Point = [0, -3.2];
  const one = (angle: number, L: number, w: number) =>
    petalPath(L, w, between(rand, 1, 1.7), between(rand, -0.4, 0.4), (q) => rotateBy(angle, base)(q));
  const spread = between(rand, 50, 62);
  const back = [one(-spread, 11.2, 4.3), one(spread, 11.2, 4.3)];
  const lean = between(rand, -7, 7);
  const front = [one(lean - 27, 12.2, 5), one(lean + 27, 12.2, 5), one(lean, 12.6, 5.6)];
  // 萼筒（壺の形）と、反り返った萼片
  const calyx =
    'M-.75 0C-1.5 -1.2 -2.3 -2.6 -2 -4.3L2 -4.3C2.3 -2.6 1.5 -1.2 .75 0Z' +
    'M-1.9 -3.8L-4.6 -5.6L-1.4 -5Z' +
    'M1.9 -3.8L4.6 -5.6L1.4 -5Z';
  // 花びらの縁からのぞく蕊
  let stamens = '';
  const anthers: Point[] = [];
  for (let i = 0; i < 6; i++) {
    const a = lean + between(rand, -52, 52);
    const tip = rotateBy(a, base)([0, -between(rand, 12.6, 14.6)]);
    stamens += `M${pt(rotateBy(a, base)([0, -9]))}L${pt(tip)}`;
    anthers.push(tip);
  }
  return { back, front, calyx, stamens, anthers: dots(anthers, 0.5) };
}

/** 蕾。付け根が原点で、上（-y）を向く */
function budShape(rand: Random) {
  const h = between(rand, 9.4, 11);
  const w = between(rand, 2.5, 3.1);
  const body =
    `M0 ${f(-h)}C${f(w * 0.62)} ${f(-h + 1.5)} ${f(w * 1.06)} ${f(-h * 0.66)} ${f(w)} ${f(-h * 0.46)}` +
    `C${f(w * 0.9)} ${f(-h * 0.28)} ${f(w * 0.45)} -2.3 0 -2.3` +
    `C${f(-w * 0.45)} -2.3 ${f(-w * 0.9)} ${f(-h * 0.28)} ${f(-w)} ${f(-h * 0.46)}` +
    `C${f(-w * 1.06)} ${f(-h * 0.66)} ${f(-w * 0.62)} ${f(-h + 1.5)} 0 ${f(-h)}Z`;
  // ほころびかけた花びらの重なり
  const fold = `M${f(-w * 0.2)} ${f(-h + 0.9)}C${f(w * 0.5)} ${f(-h * 0.7)} ${f(w * 0.4)} ${f(-h * 0.45)} ${f(-w * 0.1)} -2.8`;
  const calyx =
    `M-.7 0C-1.3 -1 -1.9 -2 -1.7 -3.4L1.7 -3.4C1.9 -2 1.3 -1 .7 0Z` +
    `M-1.7 -3.2C-2.2 -4.4 -1.9 -5.4 -1.3 -6.4C-1 -5.2 -.7 -4.4 -.2 -3.4Z` +
    `M1.7 -3.2C2.2 -4.4 1.9 -5.4 1.3 -6.4C1 -5.2 .7 -4.4 .2 -3.4Z`;
  return { body, fold, calyx };
}

const shapeRandom = seeded(2026);
export const frontShapes = Array.from({ length: 6 }, () => frontBlossom(shapeRandom));
export const sideShapes = Array.from({ length: 3 }, () => sideBlossom(shapeRandom));
export const budShapes = Array.from({ length: 2 }, () => budShape(shapeRandom));

/** 舞う花びら一枚（付け根が下、viewBox は -7 -14.4 14 15） */
export const fallingPetalPath = petalPath(13.4, 6.2, 1.9, 0.25, (p) => p);

/* ====================================================================
   花を枝に咲かせる
   ==================================================================== */

type Placed = readonly [number, number, number, BlossomKind];

export interface Flower {
  /** 参照する型の id（SakuraDefs が定義する） */
  href: string;
  transform: string;
  delay: number;
}

interface Bloomed {
  flowers: Flower[];
  /** 花柄をまとめた一本のパス */
  stalks: string;
}

/** いちばん近い枝の点（にじみでずれた後の位置） */
function nearestOnBranches(spines: Spine[], x: number, y: number) {
  let best = { d: Infinity, p: [x, y] as Point, width: 0 };
  for (const s of spines) {
    for (let i = 0; i < s.points.length; i++) {
      const p = s.points[i];
      const d = Math.hypot(p[0] - x, p[1] - y);
      if (d < best.d) best = { d, p, width: s.widths[i] };
    }
  }
  return best;
}

function bloom(placed: readonly Placed[], spines: Spine[], rand: Random, firstDelay: number, stagger: number): Bloomed {
  const flowers: Flower[] = [];
  let stalks = '';

  placed.forEach(([x, y, scale, kind], i) => {
    const near = nearestOnBranches(spines, x, y);
    const onBranch = near.d < 3;
    // 枝から離れる向き。枝の上に乗っている花は、上か下へ少し倒す
    const away = onBranch
      ? (rand() < 0.5 ? -1 : 1) * between(rand, 20, 160) - 90
      : Math.atan2(y - near.p[1], x - near.p[0]) / RAD;
    const facing = away + 90; // 型の「上」をこの向きへ回す

    // 小さい花ほど、横顔や蕾にする（遠くの花・咲きかけの花）
    const roll = rand();
    const type = scale <= 0.65
      ? (roll < 0.2 ? 'bud' : roll < 0.46 ? 'side' : 'front')
      : scale <= 0.8
        ? (roll < 0.04 ? 'bud' : roll < 0.22 ? 'side' : 'front')
        : (roll < 0.08 ? 'side' : 'front');

    const delay = round(firstDelay + i * stagger + rand() * 0.4, 2);
    // 付け根。横顔と蕾は、置いた位置が花の中ほどに来るよう手前へ引く
    let root: Point = [x, y];
    if (type === 'front') {
      // 正面の花は、傾きに応じて楕円につぶす（こちらを向いていない花）
      const squash = between(rand, 0.68, 1);
      const s = scale * between(rand, 1, 1.16);
      flowers.push({
        href: `#bl-f${kind}-${Math.floor(rand() * frontShapes.length)}`,
        transform: `translate(${x} ${y}) rotate(${Math.round(rand() * 360)}) scale(${round(s, 2)} ${round(s * squash, 2)})`,
        delay,
      });
    } else {
      const pull = (type === 'bud' ? 5 : 6.5) * scale;
      root = [x - Math.cos(away * RAD) * pull, y - Math.sin(away * RAD) * pull];
      const s = round(scale * (type === 'bud' ? between(rand, 1, 1.25) : between(rand, 0.95, 1.1)), 2);
      const href = type === 'bud'
        ? `#bl-b-${Math.floor(rand() * budShapes.length)}`
        : `#bl-s${kind}-${Math.floor(rand() * sideShapes.length)}`;
      flowers.push({
        href,
        transform: `translate(${round(root[0])} ${round(root[1])}) rotate(${Math.round(facing + between(rand, -14, 14))}) scale(${s})`,
        delay,
      });
    }

    // 花柄。枝から花の付け根へ、重みで少したわませる
    const reach = Math.hypot(root[0] - near.p[0], root[1] - near.p[1]);
    if (reach > 2.5 && reach < 40) {
      const mx = (near.p[0] + root[0]) / 2 + between(rand, -0.14, 0.14) * reach;
      const my = (near.p[1] + root[1]) / 2 + 0.16 * reach;
      stalks += `M${pt(near.p)}Q${f(mx)} ${f(my)} ${pt(root)}`;
    }
  });

  return { flowers, stalks };
}

/** 小枝の先に蕾を足す（咲ききっていない枝先） */
function tipBuds(spines: Spine[], rand: Random): Placed[] {
  const out: Placed[] = [];
  for (const s of spines) {
    if (s.branch.width > 3.1) continue;
    const tip = s.points[s.points.length - 1];
    const before = s.points[Math.max(0, s.points.length - 4)];
    const heading = Math.atan2(tip[1] - before[1], tip[0] - before[0]) / RAD;
    const count = 1 + Math.floor(rand() * 2);
    for (let i = 0; i < count; i++) {
      const a = (heading + between(rand, -50, 50)) * RAD;
      const r = between(rand, 6, 11);
      out.push([round(tip[0] + Math.cos(a) * r), round(tip[1] + Math.sin(a) * r), round(between(rand, 0.5, 0.62), 2), 1]);
    }
  }
  return out;
}

/* ---------- ヒーローの桜 ---------- */

const barkRandom = seeded(77);
export const inkBranches = branches.map((b) => inkBranch(b, inkRough, 0.25, barkRandom));

const branchShift = displacement(inkRough);
export const inkMoss = moss.map(([cx, cy, rx, ry, angle]) => {
  const [x, y] = shiftPoint([cx, cy], branchShift);
  return { cx: round(x), cy: round(y), rx, ry, angle };
});

/**
 * 房をふくらませる。手で置いた花のそばに、ひとまわり小さい花を添える。
 * 元の花より先に並べるので、奥に咲いているように重なる。
 */
function withCompanions(placed: readonly Placed[], rand: Random): Placed[] {
  const out: Placed[] = [];
  for (const flower of placed) {
    const [x, y, scale] = flower;
    if (scale >= 0.7 && rand() < 0.55) {
      const a = rand() * 360 * RAD;
      const r = between(rand, 9, 15) * scale;
      const roll = rand();
      out.push([
        round(x + Math.cos(a) * r),
        round(y + Math.sin(a) * r),
        round(scale * between(rand, 0.72, 0.92), 2),
        roll < 0.5 ? 0 : roll < 0.85 ? 1 : 2,
      ]);
    }
    out.push(flower);
  }
  return out;
}

const heroRandom = seeded(1013);
const heroSpines = inkBranches.map((b) => b.spine);
export const heroBloom = bloom(
  [...withCompanions(blossoms, heroRandom), ...tipBuds(heroSpines, heroRandom)],
  heroSpines,
  heroRandom,
  1.15,
  0.012,
);

/* ---------- 別ページの枝飾り ---------- */

/** 枝に沿って房を作る。枝先ほど密に、太い枝の根もとはまばらに */
function growBlossoms(spines: Spine[], rand: Random): Placed[] {
  const out: Placed[] = [];
  for (const s of spines) {
    const thin = s.branch.width <= 3;
    let gap = 0;
    for (let i = 1; i < s.points.length; i++) {
      const t = s.along[i];
      if (t < (thin ? 0.25 : 0.34)) continue;
      const step = Math.hypot(s.points[i][0] - s.points[i - 1][0], s.points[i][1] - s.points[i - 1][1]);
      gap -= step;
      const atTip = i === s.points.length - 1;
      if (gap > 0 && !atTip) continue;
      gap = between(rand, thin ? 15 : 22, thin ? 25 : 36);
      const count = atTip ? 3 : 1 + Math.floor(rand() * (thin ? 2.3 : 1.6));
      for (let k = 0; k < count; k++) {
        const a = rand() * 360 * RAD;
        const r = between(rand, 5, atTip ? 12 : 15);
        const kindRoll = rand();
        out.push([
          round(s.points[i][0] + Math.cos(a) * r),
          round(s.points[i][1] + Math.sin(a) * r + 3),
          round(between(rand, 0.5, 0.84), 2),
          kindRoll < 0.56 ? 0 : kindRoll < 0.86 ? 1 : 2,
        ]);
      }
    }
  }
  return out;
}

export const sprigArt = Object.fromEntries(
  Object.entries(sprigs).map(([name, spec]) => {
    const rand = seeded(spec.seed);
    const ink = spec.branches.map((b) => inkBranch(b, inkRoughFine, 0.3, rand));
    const spines = ink.map((b) => b.spine);
    const placed = [...growBlossoms(spines, rand), ...tipBuds(spines, rand)];
    return [name, { size: spec.size, branches: ink, ...bloom(placed, spines, rand, 0.55, 0.014) }];
  }),
) as Record<keyof typeof sprigs, { size: [number, number]; branches: ReturnType<typeof inkBranch>[] } & Bloomed>;

/* ====================================================================
   舞う花びら
   ==================================================================== */

/**
 * 風は右上から左下へ吹く。花びらは奥・中・手前の三層に分け、
 * 手前ほど大きく速く、奥ほど小さくゆっくり落とす。
 * 落ち方は二通り。ひらひらと左右へ滑りながら傾くもの（flutter）と、
 * くるくると裏返り続けるもの（tumble）。
 */
export function makePetals(count: number, seed: number) {
  const rand = seeded(seed);
  return Array.from({ length: count }, (_, i) => {
    const depth = i % 9 === 0 ? 'near' : i % 3 === 1 ? 'far' : 'mid';
    const size = depth === 'near' ? between(rand, 21, 28) : depth === 'far' ? between(rand, 6, 9) : between(rand, 10, 16);
    const duration = depth === 'near' ? between(rand, 7.5, 10) : depth === 'far' ? between(rand, 17, 25) : between(rand, 11, 16);
    const tumble = rand() < 0.38;
    const sign = () => (rand() < 0.5 ? -1 : 1);
    return {
      depth,
      tumble,
      /** 出発点（vw）。左へ流されるので、右の外からも降らせる */
      x: round(between(rand, -4, 128)),
      /** 落ちきるまでに風に流される量（vw） */
      drift: round(-between(rand, 12, 40)),
      duration: round(duration),
      delay: round(-rand() * duration),
      size: Math.round(size),
      /** 左右へ滑る幅（px）と、その片道の時間（秒） */
      amp: Math.round(size * between(rand, 1.4, 2.8)),
      sway: round(between(rand, 1.5, 2.9)),
      swayDelay: round(-rand() * 4),
      /** flutter: 行き来する傾き（度）。tumble: 裏返る向き（±360、横は回さないこともある） */
      tiltX: tumble ? 360 * sign() : Math.round(between(rand, 38, 68)) * sign(),
      tiltY: tumble ? (rand() < 0.5 ? 0 : 360 * sign()) : Math.round(between(rand, 25, 70)) * sign(),
      /** tumble が一回りする時間（秒） */
      spin: round(between(rand, 2.8, 5.6)),
      /** はじめから寝かせておく角度 */
      rest: Math.round(rand() * 360),
      /** 色は --fall-1〜5（テーマで切り替わる） */
      tone: (i % 5) + 1,
    };
  });
}

export const fallingPetals = makePetals(fallingPetalCount, 34);
/** 別ページに、まばらに降らせる分 */
export const strayPetals = makePetals(9, 58);
