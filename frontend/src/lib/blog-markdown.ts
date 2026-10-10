import { parseFrontmatter, unquote } from './content';

const modules = import.meta.glob('../../content/blog/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

const markdownBySlug = new Map(
  Object.entries(modules).map(([path, source]) => {
    const { values, body } = parseFrontmatter(path, source);
    return [unquote(values.get('slug') ?? ''), body] as const;
  })
);

export function getArticleMarkdownByPath(path: string) {
  const slug = path.split('/').filter(Boolean).at(-1) ?? '';
  return markdownBySlug.get(slug) ?? '';
}
