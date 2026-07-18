// トップページ（index.astro）の文言はこのファイルでまとめて編集できます。
import { siGithub, siQiita, siX, siZenn } from 'simple-icons';

// <head> に出力されるページタイトルと説明文
// title はブログ記事ページのタイトル末尾（記事名 | 栖 - SUMIKA）や og:site_name にも使われます
export const seo = {
  title: '栖 - SUMIKA',
  description: '制作物や技術記事、日々の記録をまとめた個人サイト。',
  // meta author / article:author に使われる名前
  author: 'Juna1013',
} as const;

// ヒーロー（ファーストビュー）の文言
// leadLines / about.introduction では ==語== で囲むと朱色のマーカーが引かれます
export const hero = {
  name: '桜花爛漫',
  sub: 'いつかは散る、その花に。',
  // 1要素が1行として表示されます（行間に改行が入ります）
  leadLines: [
    '日々の記録と、開発したものと、考えたことを==築く場所==。',
    'I built thoughtful web interfaces with clean code and careful attention to detail. Currently exploring frontend development with TypeScript.',
  ],
  tagline: 'STUDENT · BUILDER — JUNA1013',
  scrollHint: '巡る',
} as const;

// About セクションの文言
export const about = {
  eyebrow: 'ABOUT — 私',
  title: 'A little about me',
  introduction: [
    '機械工学を専攻する高専生です。',
    'Webアプリケーションを中心に趣味や授業で開発を行っています。時間を惜しまず、==丁寧に開発する==ことを心掛けています。',
    'モダンまたは==和風なデザイン==が好きです。',
    'デザインに限らず、情報工学的な理論も好きです。特に==LLM==については力を入れています。',
    'このサイトでは、個人的な制作物や日々の学び、記録などを残していくつもりです。'
  ],
  // 使っている技術・学んでいるもの（チップ状に並んで表示されます）
  skills: [
    { title: 'Things I work with:', items: ['C/C++', 'Python', 'HTML / CSS', 'React', 'Astro'] },
    { title: 'Currently exploring:', items: ['LLM', 'Ruby', 'AI', 'AtCoder'] },
  ],
  footprint: {
    title: 'FootPrint',
    subtitle: '— 足跡',
    // year: 'YYYY.MM' 形式で書くと「Aug 2006」のような表記で表示されます
    // description: ひとこと説明。'' のままにするとその行は表示されません
    entries: [
      { year: '2006.08', text: '誕生', description: '人生の始まり' },
      { year: '2022.04', text: '茨城高専 本科入学', description: '茨城高専に入学し、高専生の道を始める' },
      { year: '2024.10', text: 'はじめてのWebサイト開発', description: '第33回茨香祭にてクラスのWebサイトを開発' },
      { year: '2025.05', text: 'DCON2025 本選出場 - Locker.ai', description: 'LLM×スマートロッカーによる自動応対遺失物管理サービス' },
      { year: '2025.08', text: '茨城県警 サイバー防犯ボランティア 委嘱', description: '県内の複数にて啓発活動を実施' },
      { year: '2026.07', text: 'ポートフォリオサイトを公開', description: '自身のポートフォリオサイトを公開' },
    ],
  },
} as const;

// フッターのSNSリンク（href に各プロフィールのURLを設定してください）
// アイコンは simple-icons（https://simpleicons.org/）を使用
export const socialLinks = [
  { label: 'GitHub', icon: siGithub, text: 'GITHUB', href: 'https://github.com/Juna1013' },
  { label: 'X', icon: siX, text: 'X', href: '#' },
  { label: 'Zenn', icon: siZenn, text: 'ZENN', href: 'https://zenn.dev/jun1013' },
  { label: 'Qiita', icon: siQiita, text: 'QIITA', href: 'https://qiita.com/juna1013' },
] as const;

// フッターの謝辞（linkText の部分がリンクになります）
export const acknowledgment = {
  prefix: 'このサイトの構成は ',
  linkText: 'koutyuke.dev',
  href: 'https://koutyuke.dev',
  suffix: ' を参考にさせていただきました。',
} as const;

// フッターの著作権表記
export const copyright = '© 2026 Juna1013';
