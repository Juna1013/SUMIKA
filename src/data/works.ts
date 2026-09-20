// WORKSセクションの文言・タグ・リンクはこのファイルでまとめて編集できます。
// links: label が表示テキスト、href がリンク先。項目の追加・削除も自由です。
export const works = {
  eyebrow: 'WORKS — 軌跡',
  title: '制作物',
  items: [
    {
      character: '墨',
      title: '墨戯 - BOKUGI',
      description: 'ブラウザ上で和紙への落墨・にじみ・かすれを物理シミュレーションで再現する水墨画アプリ。WebGPUのコンピュートシェーダーで毛細管拡散と移流を解き、描いた作品はPNGで書き出せる。',
      tags: ['TYPESCRIPT', 'WEBGPU', 'VITE'],
      links: [
        { label: 'DEMO ↗', href: 'https://bokugi.juna1013.workers.dev/' },
        { label: 'GITHUB ↗', href: 'https://github.com/Juna1013/BOKUGI' },
      ],
    },
    {
      character: '索',
      title: 'security-rag',
      description: 'サイバーセキュリティ啓発イベントの展示用に開発したRAGプロトタイプ。解説記事を知識源に、埋め込みベクトルの類似度検索とGeminiで出典付きの回答を生成する。ITクイズ100問も収録。',
      tags: ['NEXT.JS', 'GEMINI', 'RAG'],
      links: [
        { label: 'DEMO ↗', href: 'https://nitic-rag.vercel.app' },
        { label: 'GITHUB ↗', href: 'https://github.com/Juna1013/security-rag-app' },
      ],
    },
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
