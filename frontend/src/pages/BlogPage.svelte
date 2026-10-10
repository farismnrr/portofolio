<script lang="ts">
  import { articles, formatArticleDate } from '../lib/blog-content';
  import { navigate } from '../lib/router';
  import { pageCopy } from '../lib/structured-content';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <header class="border-b border-black/10 pb-9">
      <h1 class="text-[40px] font-semibold tracking-[-0.03em] md:text-[48px]">{pageCopy.blog.title}</h1>
      <p class="mt-4 max-w-none hyphens-auto text-justify text-[16px] leading-7 text-black/58">{pageCopy.blog.subtitle}</p>
    </header>

    <section>
      {#each articles as article}
        {@const articlePath = '/blog/' + article.slug}
        <article class="border-b border-black/10 py-8 lg:py-9">
          <a
            href={articlePath}
            on:click={(e)=>navigate(e,articlePath)}
            class="grid gap-4 md:grid-cols-[150px_minmax(0,1fr)] md:gap-8"
          >
            <div class="text-[13px] leading-6 text-black/42">
              <p>{formatArticleDate(article.published)}</p>
              <p>{article.readTime}</p>
            </div>

            <div class="min-w-0">
              <p class="text-[12px] text-black/46">{article.category}</p>
              <h2 class="mt-2 text-balance text-[26px] font-semibold leading-tight tracking-[-0.025em] md:text-[30px]">{article.title}</h2>
              <p class="mt-4 hyphens-auto text-justify text-[15px] leading-7 text-black/56">{article.excerpt}</p>
              <span class="mt-5 inline-block text-[13px] underline decoration-black/20 underline-offset-4">Read article →</span>
            </div>
          </a>
        </article>
      {/each}
    </section>
  </PageShell>
</main>
