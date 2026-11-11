/**
 * 和柄を、繰り返しの効く SVG タイルとして作る。
 *
 * どれも線だけの絵で、CSS のマスクとして使う（色は background-color で
 * 塗るので、配色の切替にそのまま追従する）。
 */

const f = (n: number) => String(Math.round(n * 100) / 100);

function tile(width: number, height: number, body: string, strokeWidth: number) {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${f(width)}" height="${f(height)}" viewBox="0 0 ${f(width)} ${f(height)}">` +
    `<g fill="none" stroke="#000" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round">${body}</g></svg>`;
  return { width, height, url: `url("data:image/svg+xml,${encodeURIComponent(svg)}")` };
}

/**
 * 青海波。同心の円を鱗のように重ねた波。
 * 手前（下の段）の波に隠れる部分は、切り抜きで描かないようにする。
 */
function seigaiha(R = 20) {
  const rings = [1, 0.74, 0.48, 0.22].map((k) => k * R);
  let defs = '';
  let body = '';
  let n = 0;
  // 段は R/2 ずつ下がり、一段ごとに半波ずれる。タイルは 2R × R
  for (let row = -2; row <= 4; row++) {
    const cy = (row * R) / 2;
    const offset = row % 2 === 0 ? 0 : R;
    for (let col = -1; col <= 2; col++) {
      const cx = col * 2 * R + offset;
      const id = `c${n++}`;
      const hole = (x: number, y: number) =>
        `M${f(x - R)} ${f(y)}a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 ${-2 * R} 0Z`;
      defs +=
        `<clipPath id="${id}"><path clip-rule="evenodd" d="M${-4 * R} ${-4 * R}h${12 * R}v${10 * R}h${-12 * R}Z` +
        hole(cx - R, cy + R / 2) + hole(cx + R, cy + R / 2) + hole(cx, cy + R) + `"/></clipPath>`;
      body += `<g clip-path="url(#${id})">` + rings.map((r) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>`).join('') + '</g>';
    }
  }
  return tile(2 * R, R, `<defs>${defs}</defs>${body}`, 0.9);
}

/** 麻の葉。正三角形の格子と、各三角形の重心から頂点へ引く線 */
function asanoha(a = 28) {
  const h = (a * Math.sqrt(3)) / 2;
  let d = '';
  const line = (x1: number, y1: number, x2: number, y2: number) => { d += `M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}`; };
  for (let row = -1; row <= 2; row++) {
    const y = row * h;
    const shift = row % 2 === 0 ? 0 : a / 2;
    for (let col = -1; col <= 2; col++) {
      const x = col * a + shift;
      // 上向きの三角形 (x,y+h) (x+a,y+h) (x+a/2,y) と、下向きの三角形 (x+a/2,y) (x+3a/2,y) (x+a,y+h)
      const up: [number, number][] = [[x, y + h], [x + a, y + h], [x + a / 2, y]];
      const down: [number, number][] = [[x + a / 2, y], [x + (3 * a) / 2, y], [x + a, y + h]];
      for (const tri of [up, down]) {
        const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3;
        const cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
        for (const [px, py] of tri) line(cx, cy, px, py);
      }
      line(up[0][0], up[0][1], up[1][0], up[1][1]);
      line(up[1][0], up[1][1], up[2][0], up[2][1]);
      line(up[2][0], up[2][1], up[0][0], up[0][1]);
    }
  }
  return tile(a, 2 * h, `<path d="${d}"/>`, 0.7);
}

/** 七宝。同じ大きさの円を四分の一ずつ重ねる */
function shippo(R = 15) {
  const circles: string[] = [];
  for (const [x, y] of [[0, 0], [2 * R, 0], [0, 2 * R], [2 * R, 2 * R], [R, R], [R, -R], [-R, R], [3 * R, R], [R, 3 * R]]) {
    circles.push(`<circle cx="${x}" cy="${y}" r="${R}"/>`);
  }
  return tile(2 * R, 2 * R, circles.join(''), 0.8);
}

/** 亀甲。六角形の敷き詰め */
function kikko(s = 13) {
  const w = Math.sqrt(3) * s;
  let d = '';
  const hex = (cx: number, cy: number) => {
    for (let k = 0; k < 6; k++) {
      const a = ((60 * k + 30) * Math.PI) / 180;
      d += (k ? 'L' : 'M') + `${f(cx + s * Math.cos(a))} ${f(cy + s * Math.sin(a))}`;
    }
    d += 'Z';
    // 内側にもう一重（子持ち亀甲）
    for (let k = 0; k < 6; k++) {
      const a = ((60 * k + 30) * Math.PI) / 180;
      d += (k ? 'L' : 'M') + `${f(cx + s * 0.52 * Math.cos(a))} ${f(cy + s * 0.52 * Math.sin(a))}`;
    }
    d += 'Z';
  };
  for (let row = -1; row <= 2; row++) {
    for (let col = -1; col <= 1; col++) hex(col * w + (row % 2 === 0 ? 0 : w / 2), row * 1.5 * s);
  }
  return tile(w, 3 * s, `<path d="${d}"/>`, 0.8);
}

export const wagara = {
  seigaiha: seigaiha(),
  asanoha: asanoha(),
  shippo: shippo(),
  kikko: kikko(),
} as const;

export type WagaraName = keyof typeof wagara;

/** 桜の印（年表の受賞の印など）。五弁を塗りつぶした小さな花 */
const sakuraMark = (() => {
  const petals = [0, 72, 144, 216, 288]
    .map((a) => `<ellipse cx="12" cy="6.2" rx="3.5" ry="5.4" transform="rotate(${a} 12 12)"/>`)
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${petals}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
})();

/** :root に置く CSS 変数（--wagara-<名前> と、その一枚の大きさ） */
export const wagaraCss =
  ':root{' +
  Object.entries(wagara)
    .map(([name, t]) => `--wagara-${name}:${t.url};--wagara-${name}-size:${f(t.width)}px ${f(t.height)}px;`)
    .join('') +
  `--sakura-mark:${sakuraMark};` +
  '}';
