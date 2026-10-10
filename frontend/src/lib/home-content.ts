import { parseFrontmatter, requireKeys, unquote } from './content';

interface HomeContent {
  primaryAction: string;
  secondaryAction: string;
}

const modules = import.meta.glob('../../content/pages/home.md', {
  eager: true,
  query: '?meta',
  import: 'default'
}) as Record<string, string>;

const source = Object.entries(modules)[0];
if (!source) throw new Error('content/pages/home.md is required.');

const parsed = parseFrontmatter(source[0], source[1]);
requireKeys(source[0], parsed.values, ['primaryAction', 'secondaryAction']);

export const homeContent: HomeContent = {
  primaryAction: unquote(parsed.values.get('primaryAction') ?? ''),
  secondaryAction: unquote(parsed.values.get('secondaryAction') ?? '')
};
