<script lang="ts">
  import { navigate, path } from '../lib/router';
  import { prefetchRoute } from '../lib/routes';
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
  <PageShell className="py-8 sm:py-10 2xl:py-14">
    <a
      class="inline-flex min-h-11 items-center gap-2 text-[12px] text-black/60 hover:text-black"
      href="/blog"
      on:mouseenter={() => prefetchRoute('/blog')}
      on:focus={() => prefetchRoute('/blog')}
      on:click={(event) => navigate(event, '/blog')}
    ><AppIcon name="arrow-left" size={14}/>Blog</a>

    {#if article && rendered}
      <header class="mt-5 border-b border-black/14 pb-8 sm:mt-8 sm:pb-10 2xl:pb-12">
        <p class="text-[12px] leading-5 text-black/58 sm:text-[13px] 2xl:text-[14px]">{article.category} · {formatArticleDate(article.published)} · {article.readTime}</p>
        <h1 class="mt-4 w-full text-balance text-[36px] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-[44px] md:text-[58px] 2xl:text-[64px]">{article.title}</h1>
        <p class="mt-5 w-full hyphens-auto text-left text-[15px] leading-7 text-black/62 sm:text-justify sm:text-[17px] sm:leading-8 2xl:text-[18px]">{article.excerpt}</p>
        <MediaImage className="mt-7 aspect-[1.8] w-full sm:mt-8 sm:aspect-[2.2] 2xl:mt-10 2xl:aspect-[2.45]" src={article.cover} alt={article.title} eager/>
      </header>

      <section class="grid gap-8 py-8 sm:py-10 lg:grid-cols-[150px_minmax(0,1fr)] lg:gap-10 xl:gap-12 2xl:grid-cols-[190px_minmax(0,1fr)] 2xl:gap-16 2xl:py-12">
        <ContentToc items={rendered.toc}/>
        <div class="min-w-0">{#key article.slug}<MarkdownArticle html={rendered.html} hasMermaid={rendered.hasMermaid}/>{/key}</div>
      </section>
    {:else}
      <section class="py-20 sm:py-24">
        <p class="text-[11px] uppercase tracking-[.2em] text-black/58">Article not found</p>
        <h1 class="mt-4 text-[36px] font-semibold tracking-[-0.04em] sm:text-[44px]">This article does not exist.</h1>
        <a
          class="mt-6 inline-flex min-h-11 items-center text-[13px] text-[var(--accent)] underline underline-offset-4"
          href="/blog"
          on:mouseenter={() => prefetchRoute('/blog')}
          on:focus={() => prefetchRoute('/blog')}
          on:click={(event) => navigate(event, '/blog')}
        >Back to blog →</a>
      </section>
    {/if}
  </PageShell>
</main>
