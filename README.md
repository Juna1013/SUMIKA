# 栖 -SUMIKA-

Astro 5 と Tailwind CSS 4 で構築した、和風×桜をテーマにしたポートフォリオサイトです。

墨絵の桜、舞い散る花びら、朱の刷毛マーカー、墨のワイプ遷移など、「紙・墨・朱」を基調にした演出を取り入れています。

## 開発

Node.js を用意したうえで、プロジェクト直下で実行してください。

```bash
npm install
npm run dev
```

開発サーバーは通常 `http://localhost:4321` で起動します。

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番用ファイルを `dist/` に出力 |
| `npm run preview` | 本番ビルドをローカルで確認 |

## コンテンツの編集

文章や一覧は、ページ本体を直接編集せず、`src/data/` 内のファイルでまとめて管理しています。

| 編集対象 | ファイル |
| --- | --- |
| SEO・ヒーロー・自己紹介・経歴・SNSリンク | `src/data/about.ts` |
| 作品カード | `src/data/works.ts` |
| ブログ見出し・取得元アカウント・表示件数 | `src/data/blog.ts` |

`about.ts` のヒーロー文（`leadLines`）と自己紹介（`introduction`）では、`==語==` のように囲むと朱色の刷毛マーカーが引かれます。

### ブログ一覧について

BLOG セクションの記事一覧は、ビルド時に Zenn / Qiita の API から最新記事を自動取得して生成されます。取得元のアカウントと表示件数は `src/data/blog.ts` で設定できます。片方の取得に失敗しても、もう片方だけで一覧を作りビルドは継続されます。

## 見た目のカスタマイズ

- レイアウトや余白: 各 Astro ファイルの Tailwind CSS ユーティリティ
- カラーテーマ・マーカー・アニメーション: `src/styles/global.css`
- 桜の配置・花びら・波紋・画面遷移などの動き: `src/scripts/main.js`
- ファビコン（落款印風の桜ロゴ）: `public/favicon.svg`

## ディレクトリ構成

```text
src/
├── components/    # 共通Astroコンポーネント（ヘッダー・セクション・SEO など）
├── data/          # About / Works / Blog の編集用データ
├── pages/
│   └── index.astro
├── scripts/
│   └── main.js    # 桜の描画・花びら・波紋・ハッシュルーティング
├── styles/
│   └── global.css
└── utils/         # 日付整形・Zenn / Qiita のフィード取得
public/
└── favicon.svg
```

`node_modules/`、`.astro/`、`dist/`、環境変数ファイルは Git 管理の対象外です。
