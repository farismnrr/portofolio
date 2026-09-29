<script lang="ts">
  import { articles, featuredArticle, formatArticleDate } from '../lib/blog-content';
  import { navigate } from '../lib/router';
  import MediaImage from '../lib/ui/MediaImage.svelte';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';

  $: featuredPath = featuredArticle ? '/blog/' + featuredArticle.slug : '/blog';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <div class="border-b border-black/10 pb-10">
      <PageIntro eyebrow="Engineering journal" title="Notes on software, systems, and things" subtitle="I learn while building them." description="Practical notes, technical deep dives, and lessons from building and operating real systems across backend, AI, cloud infrastructure, and connected devices." compact/>
    </div>

    {#if featuredArticle}
      <section class="grid gap-10 border-b border-black/10 py-10 lg:grid-cols-[1fr_1fr]">
        <div class="self-center">
          <p class="text-[11px] font-semibold uppercase tracking-[.2em] text-black/50">Featured</p>
          <p class="mt-4 text-[13px] text-black/45">{featuredArticle.category} · {featuredArticle.readTime} · {formatArticleDate(featuredArticle.published)}</p>
          <h2 class="mt-6 text-[30px] font-semibold tracking-[-0.03em]">{featuredArticle.title}</h2>
          <p class="mt-4 max-w-xl text-[15px] leading-7 text-black/56">{featuredArticle.excerpt}</p>
          <a class="btn btn-neutral mt-7 rounded-none border-0 bg-[#344534] px-7 font-normal" href={featuredPath} on:click={(e)=>navigate(e,featuredPath)}>Read article →</a>
        </div>
        <MediaImage className="aspect-[1.7] w-full" src={featuredArticle.cover} alt={featuredArticle.title} eager/>
      </section>
    {/if}

    <section class="pt-8">
      <div class="flex justify-between text-[12px]"><strong class="uppercase tracking-[.2em]">All articles</strong><span class="text-black/45">{articles.length} articles</span></div>
      {#each articles as article}
        {@const articlePath = '/blog/' + article.slug}
        <a href={articlePath} on:click={(e)=>navigate(e,articlePath)} class="grid gap-5 border-b border-black/10 py-7 md:grid-cols-[150px_1fr_30px]">
          <span class="pt-1 text-[13px] text-black/42">{formatArticleDate(article.published)}</span>
          <div><p class="text-[12px] text-black/50">{article.category} · {article.readTime}</p><h2 class="mt-2 text-[22px] font-semibold tracking-[-0.02em]">{article.title}</h2><p class="mt-2 max-w-3xl text-[14px] leading-6 text-black/55">{article.excerpt}</p></div>
          <span class="self-center text-lg">→</span>
        </a>
      {/each}
    </section>
  </PageShell>
</main>
