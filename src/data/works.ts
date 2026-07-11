// WORKSセクションの文言・タグ・リンクはこのファイルでまとめて編集できます。
export const works = {
  eyebrow: 'WORKS — 作',
  title: '公開アプリケーション',
  items: [
    {
      character: '墨',
      title: 'sumi-ink.js',
      description: '水墨のにじみを再現する物理シミュレーションライブラリ。セルオートマトンで毛細管拡散を解き、Canvasに墨を落とせる。',
      tags: ['JAVASCRIPT', 'CANVAS', 'PHYSICS'],
      links: ['DEMO ↗', 'GITHUB ↗'],
      href: '#/works',
    },
    {
      character: '暦',
      title: 'Contribution Todo',
      description: 'GitHubの「草」をTodoに移植した習慣トラッカー。達成量を分位数でしきい値化して色分けし、カラーテーマ切替に対応。',
      tags: ['REACT', 'VISUALIZATION'],
      links: ['DEMO ↗', 'GITHUB ↗'],
      href: '#/works',
    },
    {
      character: '音',
      title: 'Tone.js DJ Console',
      description: 'Tone.jsで組んだブラウザDJコンソール。文化祭のフロアを自分のコードで鳴らすために制作。',
      tags: ['TONE.JS', 'WEB AUDIO'],
      links: ['DEMO ↗', 'GITHUB ↗'],
      href: '#/works',
    },
  ],
} as const;
