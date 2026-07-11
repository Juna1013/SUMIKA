# JUNA Portfolio

Astroで構築したポートフォリオサイトです。

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
| 自己紹介・経歴 | `src/data/about.ts` |
| 作品カード | `src/data/works.ts` |
| ブログ一覧 | `src/data/blog.ts` |

見た目やレイアウトは `src/styles/global.css`、桜・波紋・画面遷移などの動きは `src/scripts/main.js` で編集できます。

## ディレクトリ構成

```text
src/
├── data/          # About / Works / Blog の編集用データ
├── pages/
│   └── index.astro
├── scripts/
│   └── main.js
└── styles/
    └── global.css
```

`node_modules/`、`.astro/`、`dist/`、環境変数ファイルはGit管理の対象外です。
