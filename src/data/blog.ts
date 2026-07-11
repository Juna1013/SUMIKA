// BLOGセクションの文言・記事一覧はこのファイルでまとめて編集できます。
export const blog = {
  eyebrow: 'BLOG — 記',
  title: 'ブログ',
  posts: [
    { date: '2026.06', source: 'Q', title: 'LLMエージェントのツールチェーンは深いほど危ないのか — arXiv:2507.06323 を読む', href: '#/blog' },
    { date: '2026.05', source: 'Z', title: '墨のにじみをセルオートマトンで再現する — sumi-ink.js の設計メモ', href: '#/blog' },
    { date: '2026.04', source: 'Z', title: '二分木探索を非再帰で書く — スタックで巻き取る', href: '#/blog' },
  ],
  note: '記事の一覧は Zenn / Qiita のプロフィールからどうぞ。',
} as const;
