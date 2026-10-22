import { parseFrontmatter, unquote } from './content';

const modules = import.meta.glob('../../content/projects/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

const projectContentBySlug = new Map(
  Object.entries(modules).map(([path, source]) => {
    const { values, body } = parseFrontmatter(path, source);
    return [unquote(values.get('slug') ?? ''), body] as const;
  })
);

export function getProjectContributionsBySlug(slug: string) {
  const markdown = projectContentBySlug.get(slug) ?? '';
  const contributionSections = markdown.split(/^##\s+Links\s*$/im, 1)[0];

  return contributionSections
    .split(/\r?\n/)
    .filter((line) => /^\s*[-*]\s+/.test(line))
    .map((line) => line.replace(/^\s*[-*]\s+/, '').replace(/\*\*/g, '').trim());
}
