<script lang="ts">
  import { path } from '../lib/router';
  import { formatArticleDate, getArticleByPath } from '../lib/blog-content';
  import { renderMarkdown } from '../lib/markdown';
  import AppIcon from '../lib/ui/AppIcon.svelte';
  import ContentToc from '../lib/ui/ContentToc.svelte';
  import MarkdownArticle from '../lib/ui/MarkdownArticle.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';

  $: article = getArticleByPath($path);
  $: rendered = article ? renderMarkdown(article.markdown) : null;
</script>

<main>
  <PageShell className="py-10">
    <a class="flex items-center gap-2 text-[12px] text-black/55 hover:text-black" href="/blog"><AppIcon name="arrow-left" size={14}/>Blog</a>

    {#if article && rendered}
      <header class="mt-8 border-b border-black/10 pb-10">
        <p class="text-[13px] text-black/45">{article.category} · {formatArticleDate(article.published)} · {article.readTime}</p>
        <h1 class="mt-4 w-full text-balance text-[44px] font-semibold leading-[1.04] tracking-[-0.035em] md:text-[58px]">{article.title}</h1>
        <p class="mt-5 w-full hyphens-auto text-justify text-[17px] leading-8 text-black/56">{article.excerpt}</p>
        <MediaImage className="mt-8 aspect-[2.2] w-full" src={article.cover} alt={article.title} eager/>
      </header>

      <section class="grid gap-10 py-10 lg:grid-cols-[150px_minmax(0,1fr)] xl:gap-12">
        <ContentToc items={rendered.toc}/>
        <div class="min-w-0">{#key article.slug}<MarkdownArticle html={rendered.html} hasMermaid={rendered.hasMermaid}/>{/key}</div>
      </section>
    {:else}
      <section class="py-24">
        <p class="text-[11px] uppercase tracking-[.2em] text-black/45">Article not found</p>
        <h1 class="mt-4 text-[44px] font-semibold tracking-[-0.04em]">This article does not exist.</h1>
        <a class="mt-6 inline-block text-[13px] underline underline-offset-4" href="/blog">Back to blog →</a>
      </section>
    {/if}
  </PageShell>
</main>
