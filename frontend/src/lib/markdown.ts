import { marked } from 'marked';

export interface TocItem { id: string; text: string; level: number; }
export interface RenderedMarkdown { html: string; toc: TocItem[]; hasMermaid: boolean; }

function stripTags(value: string) { return value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"); }
function slugify(value: string) { return stripTags(value).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-'); }

const mermaidPlaceholder = `<div class="mermaid-shell group not-prose relative my-10 min-h-[220px] overflow-hidden border border-black/10 bg-white/45 p-5 md:p-8" data-state="pending">
  <div class="mermaid-skeleton absolute inset-0 flex animate-pulse flex-col justify-center gap-4 p-6 group-data-[state=rendered]:hidden md:p-10" aria-hidden="true">
    <div class="h-4 w-1/3 rounded bg-black/10"></div>
    <div class="h-16 w-3/4 rounded bg-black/[0.06]"></div>
    <div class="h-4 w-1/2 rounded bg-black/10"></div>
  </div>
  <pre class="mermaid invisible pointer-events-none absolute inset-0 m-0 bg-transparent p-0 group-data-[state=rendered]:visible group-data-[state=rendered]:pointer-events-auto group-data-[state=rendered]:static [&_svg]:h-auto [&_svg]:max-w-full">$1</pre>
</div>`;

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
  html = html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, mermaidPlaceholder);
  html = html.replace(/<img src="([^"]+)" alt="([^"]*)"\s*\/?>/g, '<img src="$1" alt="$2" loading="lazy" decoding="async" />');
  return { html, toc, hasMermaid };
}
