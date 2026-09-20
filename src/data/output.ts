// OUTPUTページの文言と記事取得の設定はこのファイルで編集できます。
// 一覧はビルド時に Zenn / Qiita の最新記事から自動生成されます。
export const output = {
  eyebrow: 'OUTPUT — 記',
  title: '執筆記事',
  note: '記事の一覧は Zenn / Qiita のプロフィールからどうぞ。',
  // 一覧の下に並ぶプロフィールへのリンク
  profiles: [
    { label: 'ZENN ↗', href: 'https://zenn.dev/jun1013' },
    { label: 'QIITA ↗', href: 'https://qiita.com/juna1013' },
  ],
  // 記事の取得元アカウント
  zennUsername: 'jun1013',
  qiitaUsername: 'juna1013',
  // 一覧に表示する件数
  postCount: 3,
} as const;

