import { marked } from 'marked';

export interface TocItem { id: string; text: string; level: number; }
export interface RenderedMarkdown { html: string; toc: TocItem[]; hasMermaid: boolean; }

function stripTags(value: string) { return value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"); }
function slugify(value: string) { return stripTags(value).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'); }

export function renderMarkdown(markdown: string): RenderedMarkdown {
  const parsed = marked.parse(markdown, { async: false, gfm: true, breaks: false });
  let html = String(parsed);
  const toc: TocItem[] = [];
  const seen = new Map<string, number>();
  html = html.replace(/<h([23])>([\s\S]*?)<\/h\1>/g, (_match, depthText: string, inner: string) => {
    const level = Number(depthText);
    const text = stripTags(inner);
    const base = slugify(text) || 'section';
    const duplicate = seen.get(base) ?? 0;
    seen.set(base, duplicate + 1);
    const id = duplicate ? `${base}-${duplicate + 1}` : base;
    toc.push({ id, text, level });
    return `<h${level} id="${id}">${inner}</h${level}>`;
  });
  const hasMermaid = /<code class="language-mermaid">/.test(html);
  html = html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, '<div class="not-prose my-10 overflow-x-auto border border-black/10 bg-white/45 p-5 md:p-8"><pre class="mermaid m-0 bg-transparent p-0">$1</pre></div>');
  html = html.replace(/<img src="([^"]+)" alt="([^"]*)"\s*\/?>/g, '<img src="$1" alt="$2" loading="lazy" decoding="async" />');
  return { html, toc, hasMermaid };
}
