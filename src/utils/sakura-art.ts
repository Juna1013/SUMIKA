/**
 * ヒーローの桜を、ビルド時に描き上げる。
 *
 * 墨のにじみはここで形に焼き込み、花の配置や向き、舞う花びらの乱数も
 * ここで決める。ブラウザは出来上がった絵を順に見せるだけになる。
 * 結果はモジュールの読み込み時に一度だけ計算する（開発サーバーでも毎回は計算しない）。
 */
import {
  blossoms,
  branches,
  fallingPetalCount,
  hake,
  hakeRough,
  inkRough,
  inkRoughFine,
  moss,
  petalPath,
  type BlossomKind,
} from '../data/sakura';
import {
  bake,
  bakeStroke,
  boundsOf,
  displacement,
  flattenPath,
  maxShift,
  polygonField,
  sampledField,
  shiftPoint,
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

const round = (n: number, digits = 1) => Math.round(n * 10 ** digits) / 10 ** digits;

/* ---------- 枝 ---------- */

/**
 * 描き順はマスクの線で見せる。荒れて外へ広がった縁まで覆えるよう、
 * ずらしの最大量の分だけ太くする（細いと縁が欠けたまま残る）。
 */
const revealWidth = (width: number, spec: { scale: number }) => round(width + 2 * maxShift(spec) + 0.6);

export const inkBranches = branches.map((b) => ({
  ...b,
  fill: bakeStroke(b.d, b.width, inkRough, { res: 0.25, tolerance: 0.07, minArea: 0.15 }),
  revealWidth: revealWidth(b.width, inkRough),
}));

const branchShift = displacement(inkRough);
export const inkMoss = moss.map(([cx, cy, rx, ry, angle]) => {
  const [x, y] = shiftPoint([cx, cy], branchShift);
  return { cx: round(x), cy: round(y), rx, ry, angle };
});

/* ---------- 刷毛 ---------- */

export const inkHake = {
  d: hake.d,
  fill: bakeStroke(hake.d, hake.width, hakeRough, { res: 0.6, tolerance: 0.3, minArea: 1 }),
  revealWidth: revealWidth(hake.width, hakeRough),
};

/* ---------- 花 ---------- */

/**
 * 花ごとに縁を焼くと絵が重くなりすぎるため、にじみ方の違う型を
 * いくつか作り、向きと大きさを変えて使い回す。
 * にじみは花の大きさ 0.8 のときの見え方に合わせる。
 */
const VARIANT_ANCHORS: Point[] = [[150, 60], [420, 300], [700, 120], [960, 340], [1180, 200]];
const REF_SCALE = 0.8;
const PETAL_ANGLES = [0, 72, 144, 216, 288];
/** 淡紅の花の蕊（しべ） */
const STAMENS: Point[] = [[0, -3], [2.85, -0.95], [1.75, 2.45], [-1.75, 2.45], [-2.85, -0.95]];

const petalPolygon = flattenPath(petalPath, 0.25)[0];
const petalBox = boundsOf(petalPolygon, 1);
const petalField = sampledField(polygonField(petalPolygon), petalBox, 0.05);
const petalCorners: Point[] = [
  [petalBox.x0, petalBox.y0], [petalBox.x1, petalBox.y0],
  [petalBox.x1, petalBox.y1], [petalBox.x0, petalBox.y1],
];
const blossomShift = displacement(inkRoughFine);
const blossomPad = maxShift(inkRoughFine) / REF_SCALE + 0.2;

export const blossomVariants = VARIANT_ANCHORS.map(([ax, ay]) => {
  // 花の座標でのずらし（世界の座標で計算して、花の大きさで割り戻す）
  const shift = (x: number, y: number) => blossomShift(ax + REF_SCALE * x, ay + REF_SCALE * y) / REF_SCALE;

  const petals = PETAL_ANGLES.map((deg) => {
    // 花びらは rotate(deg) translate(0 -7.4) で花の中に置かれる
    const t = (deg * Math.PI) / 180;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const toBlossom = ([x, y]: Point): Point => [c * x - s * (y - 7.4), s * x + c * (y - 7.4)];
    const field = (x: number, y: number) => petalField(c * x + s * y, -s * x + c * y + 7.4);
    const box = boundsOf(petalCorners.map(toBlossom), blossomPad);
    return bake(field, box, shift, { res: 0.07, tolerance: 0.035, minArea: 0.03 });
  });

  const at = (p: Point) => shiftPoint(p, shift).map((n) => round(n, 2)) as Point;
  return { petals, center: at([0, 0]), stamens: STAMENS.map(at) };
});

const blossomRandom = seeded(1013);
export const blossomInstances = blossoms.map(([x, y, scale, kind], i) => ({
  x,
  y,
  scale,
  kind: kind as BlossomKind,
  variant: i % VARIANT_ANCHORS.length,
  rotate: Math.round(blossomRandom() * 60 - 30),
  /** 枝先から順に咲かせつつ、少しばらつかせる */
  delay: round(1.15 + i * 0.016 + blossomRandom() * 0.4, 2),
}));

/* ---------- 舞う花びら ---------- */

const fallRandom = seeded(34);
export const fallingPetals = Array.from({ length: fallingPetalCount }, (_, i) => ({
  x: round(fallRandom() * 100),
  drift: round(fallRandom() * 22 - 11),
  duration: round(9 + fallRandom() * 10),
  delay: round(-fallRandom() * 18),
  size: Math.round(8 + fallRandom() * 9),
  sway: round(2.2 + fallRandom() * 2.4),
  /** 色は --fall-1〜5（テーマで切り替わる） */
  tone: (i % 5) + 1,
}));
