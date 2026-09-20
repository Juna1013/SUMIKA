// トップページ（index.astro）の文言はこのファイルでまとめて編集できます。
import { siAstro, siC, siCplusplus, siCss, siGithub, siHtml5, siPython, siQiita, siReact, siRuby, siX, siZenn } from 'simple-icons';

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

// About me ページの文言
export const about = {
  eyebrow: 'ABOUT ME — 私',
  title: 'A little about me',
  introduction: [
    '機械工学を専攻する高専生です。',
    'Webアプリケーションを中心に趣味や授業で開発を行っています。時間を惜しまず、==丁寧に開発する==ことを心掛けています。',
    'モダンまたは==和風なデザイン==が好きです。',
    'デザインに限らず、情報工学的な理論も好きです。特に==LLM==については力を入れています。',
    'このサイトでは、個人的な制作物や日々の学び、記録などを残していくつもりです。'
  ],
  // 使っている技術・学んでいるもの（アイコンのみで表示されます）
  // icon: simple-icons のアイコン（https://simpleicons.org/）。墨色で表示しホバーで朱に変わります
  // image: 画像ファイルのパス。simple-icons にないロゴを使う場合に指定します
  //   （透明度をマスクとして墨色で塗るため、単色・背景透過のPNGを用意してください）
  // label はアイコンの代替テキスト（スクリーンリーダー用）として使われます
  skills: [
    {
      title: 'Things I work with:',
      items: [
        { label: 'C', icon: siC },
        { label: 'C++', icon: siCplusplus },
        { label: 'Python', icon: siPython },
        { label: 'HTML', icon: siHtml5 },
        { label: 'CSS', icon: siCss },
        { label: 'React', icon: siReact },
        { label: 'Astro', icon: siAstro },
      ],
    },
    {
      title: 'Currently exploring:',
      items: [
        { label: 'Ruby', icon: siRuby },
        // AtCoder は simple-icons にないため公式ロゴを使用
        // 他のアイコンと色を揃えるため、ロゴの透明度をマスクとして currentColor で塗る
        { label: 'AtCoder', image: '/atcoder-logo.png' },
      ],
    },
  ],
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
