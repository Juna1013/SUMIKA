// WORKSセクションの文言・タグ・リンクはこのファイルでまとめて編集できます。
// links: label が表示テキスト、href がリンク先。項目の追加・削除も自由です。
export const works = {
  eyebrow: 'WORKS — 軌跡',
  title: '制作物',
  items: [
    {
      character: '祭',
      title: '3M2 丸亀クレープ 広報サイト',
      description: '第33回茨香祭のクラス出店「丸亀クレープ」の広報サイト。HTML版からNext.jsで作り直し、next-intlによる多言語表示に対応。',
      tags: ['NEXT.JS', 'TYPESCRIPT', 'I18N'],
      links: [
        { label: 'DEMO ↗', href: 'https://3m2-shikousai-marugame-v2.vercel.app' },
        { label: 'GITHUB ↗', href: 'https://github.com/Juna1013/3m2-shikousai-marugame-v2' },
      ],
    },
    {
      character: '問',
      title: 'Security-Quiz-App',
      description: '茨城県警サイバー防犯ボランティアの啓発イベント向けに制作したクイズアプリ。難易度別の出題・即時解説・日英切替に対応。',
      tags: ['NEXT.JS', 'TYPESCRIPT'],
      links: [
        { label: 'DEMO ↗', href: 'https://ibaraki-security-quiz.vercel.app' },
        { label: 'GITHUB ↗', href: 'https://github.com/Juna1013/security-quiz-app' },
      ],
    },
    {
      character: '車',
      title: 'ライントレースカー補足アプリ',
      description: 'ライントレースカーのテレメトリをリアルタイム可視化するダッシュボード。Pico Wから届くセンサー・モーター情報をブラウザで監視。',
      tags: ['NEXT.JS', 'TYPESCRIPT', 'IOT'],
      links: [
        { label: 'DEMO ↗', href: 'https://endra-hub.vercel.app' },
        { label: 'GITHUB ↗', href: 'https://github.com/Juna1013/4th-PBL-front' },
      ],
    },
  ],
} as const;
