import { output } from '../data/output';

// Output ページに表示する記事（Zenn / Qiita からビルド時に取得）
export type FeedPost = {
  title: string;
  url: string;
  pubDate: Date;
  // 一覧のイニシャル表示（Z = Zenn, Q = Qiita）
  source: 'Z' | 'Q';
};

type ZennArticle = { title: string; path: string; published_at: string };
type QiitaItem = { title: string; url: string; created_at: string };

const fetchZennPosts = async (): Promise<FeedPost[]> => {
  const res = await fetch(`https://zenn.dev/api/articles?username=${output.zennUsername}&order=latest`);
  if (!res.ok) throw new Error(`Zenn API が ${res.status} を返しました`);
  const data = (await res.json()) as { articles: ZennArticle[] };
  return data.articles.map((article) => ({
    title: article.title,
    url: `https://zenn.dev${article.path}`,
    pubDate: new Date(article.published_at),
    source: 'Z' as const,
  }));
};

const fetchQiitaPosts = async (): Promise<FeedPost[]> => {
  const res = await fetch(`https://qiita.com/api/v2/users/${output.qiitaUsername}/items?per_page=20`);
  if (!res.ok) throw new Error(`Qiita API が ${res.status} を返しました`);
  const items = (await res.json()) as QiitaItem[];
  return items.map((item) => ({
    title: item.title,
    url: item.url,
    pubDate: new Date(item.created_at),
    source: 'Q' as const,
  }));
};

// 両サービスの記事を新しい順に統合し、上位 postCount 件を返す
// 片方の取得に失敗してももう片方だけで一覧を作る（ビルドは落とさない）
export const fetchLatestPosts = async (): Promise<FeedPost[]> => {
  const results = await Promise.allSettled([fetchZennPosts(), fetchQiitaPosts()]);
  for (const result of results) {
    if (result.status === 'rejected') console.warn('[output] 記事の取得に失敗:', result.reason);
  }
  return results
    .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf())
    .slice(0, output.postCount);
};
