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
  <PageShell className="py-8 sm:py-10">
    <a class="inline-flex min-h-11 items-center gap-2 text-[12px] text-black/55 hover:text-black" href="/blog"><AppIcon name="arrow-left" size={14}/>Blog</a>

    {#if article && rendered}
      <header class="mt-5 border-b border-black/10 pb-8 sm:mt-8 sm:pb-10">
        <p class="text-[12px] leading-5 text-black/45 sm:text-[13px]">{article.category} · {formatArticleDate(article.published)} · {article.readTime}</p>
        <h1 class="mt-4 w-full text-balance text-[36px] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-[44px] md:text-[58px]">{article.title}</h1>
        <p class="mt-5 w-full hyphens-auto text-justify text-[15px] leading-7 text-black/56 sm:text-[17px] sm:leading-8">{article.excerpt}</p>
        <MediaImage className="mt-7 aspect-[1.8] w-full sm:mt-8 sm:aspect-[2.2]" src={article.cover} alt={article.title} eager/>
      </header>

      <section class="grid gap-8 py-8 sm:py-10 lg:grid-cols-[150px_minmax(0,1fr)] lg:gap-10 xl:gap-12">
        <ContentToc items={rendered.toc}/>
        <div class="min-w-0">{#key article.slug}<MarkdownArticle html={rendered.html} hasMermaid={rendered.hasMermaid}/>{/key}</div>
      </section>
    {:else}
      <section class="py-20 sm:py-24">
        <p class="text-[11px] uppercase tracking-[.2em] text-black/45">Article not found</p>
        <h1 class="mt-4 text-[36px] font-semibold tracking-[-0.04em] sm:text-[44px]">This article does not exist.</h1>
        <a class="mt-6 inline-flex min-h-11 items-center text-[13px] underline underline-offset-4" href="/blog">Back to blog →</a>
      </section>
    {/if}
  </PageShell>
</main>
