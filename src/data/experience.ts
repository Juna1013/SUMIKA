// EXPERIENCEページの文言・年表はこのファイルでまとめて編集できます。
export const experience = {
  eyebrow: 'EXPERIENCE — 歴',
  title: '経歴',
  // 足跡と受賞・活動歴を統合した年表
  // 新しい順に並べてください
  // year: 'YYYY.MM' 形式で書くと「Aug 2006」のような表記で表示されます
  // detail: 順位など。description: ひとこと説明。awards: 受賞名（朱色の枠付きで並びます）
  // detail / description は '' に、awards は [] にするとその行は表示されません
  entries: [
    {
      year: '2026.07',
      text: 'ポートフォリオサイトを公開',
      detail: '',
      description: '自身のポートフォリオサイトを公開',
      awards: [],
    },
    {
      year: '2025.11',
      text: '第8回 CTF神奈川',
      detail: '60人中6位',
      description: '',
      awards: [],
    },
    {
      year: '2025.11',
      text: '第5回 得意技・先進技術交流会 参加',
      detail: '',
      description: '',
      awards: [],
    },
    {
      year: '2025.09',
      text: 'EPSON サマーインターン 参加',
      detail: '',
      description: '',
      awards: [],
    },
    {
      year: '2025.08',
      text: '茨城県警 サイバー防犯ボランティア 委嘱',
      detail: '',
      description: '県内の複数にて啓発活動を実施',
      awards: [],
    },
    {
      year: '2025.05',
      text: 'DCON2025 本選出場 - Locker.ai',
      detail: '95チーム中5位',
      description: 'LLM×スマートロッカーによる自動応対遺失物管理サービス',
      awards: ['TOPY工業賞', '日立産業制御ソリューションズ賞', 'Quick賞'],
    },
    {
      year: '2024.10',
      text: 'はじめてのWebサイト開発',
      detail: '',
      description: '第33回茨香祭にてクラスのWebサイトを開発',
      awards: [],
    },
    {
      year: '2022.04',
      text: '茨城高専 本科入学',
      detail: '',
      description: '茨城高専に入学し、高専生の道を始める',
      awards: [],
    },
    {
      year: '2006.08',
      text: '誕生',
      detail: '',
      description: '人生の始まり',
      awards: [],
    },
  ],
} as const;
