// EXPERIENCEページの文言・年表はこのファイルでまとめて編集できます。
export const experience = {
  eyebrow: 'EXPERIENCE — 歴',
  title: '経歴',
  footprint: {
    title: 'FootPrint',
    subtitle: '— 足跡',
    // 新しい順に並べてください
    // year: 'YYYY.MM' 形式で書くと「Aug 2006」のような表記で表示されます
    // description: ひとこと説明。'' のままにするとその行は表示されません
    entries: [
      { year: '2026.07', text: 'ポートフォリオサイトを公開', description: '自身のポートフォリオサイトを公開' },
      { year: '2025.08', text: '茨城県警 サイバー防犯ボランティア 委嘱', description: '県内の複数にて啓発活動を実施' },
      { year: '2025.05', text: 'DCON2025 本選出場 - Locker.ai', description: 'LLM×スマートロッカーによる自動応対遺失物管理サービス' },
      { year: '2024.10', text: 'はじめてのWebサイト開発', description: '第33回茨香祭にてクラスのWebサイトを開発' },
      { year: '2022.04', text: '茨城高専 本科入学', description: '茨城高専に入学し、高専生の道を始める' },
      { year: '2006.08', text: '誕生', description: '人生の始まり' },
    ],
  },
  // 受賞・活動歴（新しい順に並べてください。awards: 受賞内容がある場合に朱色で併記されます）
  achievements: {
    title: '受賞・活動歴',
    subtitle: '— 賞',
    entries: [
      {
        date: '2025.11',
        text: '第8回 CTF神奈川',
        detail: '60人中6位',
        awards: [],
      },
      {
        date: '2025.11',
        text: '第5回 得意技・先進技術交流会 参加',
        detail: '',
        awards: [],
      },
      {
        date: '2025.09',
        text: 'EPSON サマーインターン 参加',
        detail: '',
        awards: [],
      },
      {
        date: '2025.08',
        text: '茨城県警 サイバーセキュリティボランティア 委嘱',
        detail: '',
        awards: [],
      },
      {
        date: '2025.05',
        text: 'DCON2025 本選出場',
        detail: '95チーム中5位',
        awards: ['TOPY工業賞', '日立産業制御ソリューションズ賞', 'Quick賞'],
      },
    ],
  },
} as const;
