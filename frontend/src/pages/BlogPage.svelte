<script lang="ts">
  import { articles, formatArticleDate } from '../lib/blog-content';
  import { navigate } from '../lib/router';
  import { pageCopy } from '../lib/structured-content';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-10 sm:py-12 lg:py-16">
    <header class="border-b border-black/10 pb-8 sm:pb-9">
      <h1 class="text-[36px] font-semibold tracking-[-0.03em] sm:text-[40px] md:text-[48px]">{pageCopy.blog.title}</h1>
      <p class="mt-4 max-w-none hyphens-auto text-justify text-[15px] leading-7 text-black/58 sm:text-[16px]">{pageCopy.blog.subtitle}</p>
    </header>

    <section>
      {#each articles as article}
        {@const articlePath = '/blog/' + article.slug}
        <article class="border-b border-black/10 py-7 sm:py-8 lg:py-9">
          <a
            href={articlePath}
            on:click={(e)=>navigate(e,articlePath)}
            class="grid gap-3 sm:gap-4 md:grid-cols-[150px_minmax(0,1fr)] md:gap-8"
          >
            <div class="flex flex-wrap gap-x-3 gap-y-1 text-[12px] leading-5 text-black/42 sm:text-[13px] md:block md:leading-6">
              <p>{formatArticleDate(article.published)}</p>
              <p>{article.readTime}</p>
            </div>

            <div class="min-w-0">
              <p class="text-[12px] text-black/46">{article.category}</p>
              <h2 class="mt-2 text-balance text-[24px] font-semibold leading-tight tracking-[-0.025em] sm:text-[26px] md:text-[30px]">{article.title}</h2>
              <p class="mt-3 hyphens-auto text-justify text-[14px] leading-6 text-black/56 sm:mt-4 sm:text-[15px] sm:leading-7">{article.excerpt}</p>
              <span class="mt-3 inline-flex min-h-10 items-center text-[13px] underline decoration-black/20 underline-offset-4 sm:mt-5">Read article →</span>
            </div>
          </a>
        </article>
      {/each}
    </section>
  </PageShell>
</main>
