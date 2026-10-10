import { parseBoolean, parseFrontmatter, requireKeys, unquote } from './content';

export interface BlogArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  published: string;
  readTime: string;
  cover: string;
  featured: boolean;
}

const modules = import.meta.glob('../../content/blog/*.md', {
  eager: true,
  query: '?meta',
  import: 'default'
}) as Record<string, string>;

function parseArticle(path: string, source: string): BlogArticle {
  const { values } = parseFrontmatter(path, source);
  const required = ['slug', 'title', 'excerpt', 'category', 'published', 'readTime', 'cover', 'featured'];
  requireKeys(path, values, required);

  const published = unquote(values.get('published') ?? '');
  if (Number.isNaN(Date.parse(published))) throw new Error(`${path}: published must be an ISO date`);

  return {
    slug: unquote(values.get('slug') ?? ''),
    title: unquote(values.get('title') ?? ''),
    excerpt: unquote(values.get('excerpt') ?? ''),
    category: unquote(values.get('category') ?? ''),
    published,
    readTime: unquote(values.get('readTime') ?? ''),
    cover: unquote(values.get('cover') ?? ''),
    featured: parseBoolean(values.get('featured') ?? 'false')
  };
}

export const articles = Object.entries(modules)
  .map(([path, source]) => parseArticle(path, source))
  .sort((a, b) => Date.parse(b.published) - Date.parse(a.published));

export const featuredArticle = articles.find((article) => article.featured) ?? articles[0];

export function getLatestArticles(limit: number) {
  return articles.slice(0, limit);
}

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getArticleByPath(path: string) {
  const slug = path.split('/').filter(Boolean).at(-1) ?? '';
  return getArticleBySlug(slug);
}

export function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
}
