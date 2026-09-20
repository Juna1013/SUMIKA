export const formatPostDate = (date: Date) =>
  `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

// 'YYYY.MM' 形式の文字列を「Aug 2006」のような表記に変換する
// 変換できない形式（例: '2026 — 現在'）はそのまま返す
export const formatFootprintDate = (yearMonth: string) => {
  const [year, month] = yearMonth.split('.');
  const monthName = MONTHS[Number(month) - 1];
  return monthName ? `${monthName} ${year}` : yearMonth;
};
