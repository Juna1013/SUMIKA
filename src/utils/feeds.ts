import { output } from '../data/output';

// Output ページに表示する記事（Zenn / Qiita からビルド時に取得）
export type FeedPost = {
  title: string;
  url: string;
  pubDate: Date;
  // 一覧のイニシャル表示（Z = Zenn, Q = Qiita）
  source: 'Z' | 'Q';
  // OGP画像のURL。取得できなかった場合は undefined
  ogImage?: string;
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
  const res = await fetch(`https://qiita.com/api/v2/users/${output.qiitaUsername}/items?per_page=100`);
  if (!res.ok) throw new Error(`Qiita API が ${res.status} を返しました`);
  const items = (await res.json()) as QiitaItem[];
  return items.map((item) => ({
    title: item.title,
    url: item.url,
    pubDate: new Date(item.created_at),
    source: 'Q' as const,
  }));
};

// Zenn / Qiita とも API が OGP画像を返さないため、記事ページの meta タグから読む
const OG_IMAGE = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i;
const OG_IMAGE_REVERSED = /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i;

const fetchOgImage = async (url: string): Promise<string | undefined> => {
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (compatible; portfolio-build)' } });
    if (!res.ok) return undefined;
    const html = await res.text();
    const matched = html.match(OG_IMAGE) ?? html.match(OG_IMAGE_REVERSED);
    // meta タグ内は & が &amp; とエスケープされているため戻す
    return matched?.[1].replace(/&amp;/g, '&');
  } catch {
    return undefined;
  }
};

// 両サービスの記事を新しい順に統合して返す
// 片方の取得に失敗してももう片方だけで一覧を作る（ビルドは落とさない）
// OGP画像は取得できたものだけ付与し、失敗した記事は画像なしで表示する
export const fetchLatestPosts = async (): Promise<FeedPost[]> => {
  const results = await Promise.allSettled([fetchZennPosts(), fetchQiitaPosts()]);
  for (const result of results) {
    if (result.status === 'rejected') console.warn('[output] 記事の取得に失敗:', result.reason);
  }
  const posts = results
    .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
    .sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());

  const ogImages = await Promise.all(posts.map((post) => fetchOgImage(post.url)));
  const missing = ogImages.filter((image) => image === undefined).length;
  if (missing > 0) console.warn(`[output] OGP画像を取得できなかった記事が ${missing} 件あります`);

  return posts.map((post, index) => ({ ...post, ogImage: ogImages[index] }));
};
