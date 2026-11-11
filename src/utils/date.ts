export const formatPostDate = (date: Date) =>
  `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/* ---------- 和の暦 ---------- */

const KANJI_DIGITS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'] as const;

/** 1〜99 を漢数字にする（18 → 十八、20 → 二十） */
export const toKanjiNumber = (n: number) => {
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return (tens > 1 ? KANJI_DIGITS[tens] : '') + (tens > 0 ? '十' : '') + KANJI_DIGITS[ones];
};

/** 元号の始まり（新しい順） */
const ERAS = [
  { name: '令和', year: 2019, month: 5 },
  { name: '平成', year: 1989, month: 1 },
  { name: '昭和', year: 1926, month: 12 },
] as const;

/** 'YYYY.MM' を「令和八年」のような和暦の年にする。昭和より前はそのまま西暦を返す */
export const toWareki = (yearMonth: string) => {
  const [year, month = 12] = yearMonth.split('.').map(Number);
  const era = ERAS.find((e) => year > e.year || (year === e.year && month >= e.month));
  if (!era) return `${year}年`;
  const n = year - era.year + 1;
  return `${era.name}${n === 1 ? '元' : toKanjiNumber(n)}年`;
};

/** 和風月名（睦月〜師走） */
const MONTH_NAMES_JA = ['睦月', '如月', '弥生', '卯月', '皐月', '水無月', '文月', '葉月', '長月', '神無月', '霜月', '師走'] as const;

/** 'YYYY.MM' の月を、英語の略記と和風月名に分ける。月が読めなければ null */
export const monthOf = (yearMonth: string) => {
  const index = Number(yearMonth.split('.')[1]) - 1;
  return MONTHS[index] ? { latin: MONTHS[index], ja: MONTH_NAMES_JA[index] } : null;
};

/** 番付に使う大字（壱・弐・参…）。十を超えたら漢数字にする */
const DAIJI = ['壱', '弐', '参', '肆', '伍', '陸', '漆', '捌', '玖', '拾'] as const;
export const toDaiji = (n: number) => DAIJI[n - 1] ?? toKanjiNumber(n);
