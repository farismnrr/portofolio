<script lang="ts">
  import { education, experiences, pageCopy } from '../lib/structured-content';
  import { renderMarkdown } from '../lib/markdown';
  import MarkdownArticle from '../lib/ui/MarkdownArticle.svelte';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import TimelineEntry from '../lib/ui/TimelineEntry.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';

  const page = pageCopy.experience;
  const rendered = renderMarkdown(page.body);
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <div class="grid gap-10 border-b border-black/10 pb-12 lg:grid-cols-[1.35fr_.65fr]">
      <PageIntro eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle}/>
      <div class="max-w-md self-end pb-2">
        <p class="text-[16px] leading-7 text-black/55">{page.description}</p>
        <div class="mt-4"><MarkdownArticle html={rendered.html} hasMermaid={rendered.hasMermaid}/></div>
      </div>
    </div>

    <section>
      {#each experiences as item, i}<TimelineEntry {item} first={i===0} last={i===experiences.length-1}/>{/each}
    </section>

    <section class="mt-12 border-t border-black/10 pt-10">
      <PageIntro eyebrow={pageCopy.education.eyebrow} title={pageCopy.education.title} subtitle={pageCopy.education.subtitle} description={pageCopy.education.description} compact/>
      <div class="mt-8">
        {#each education as item}
          <article class="grid gap-6 border-b border-black/10 py-8 md:grid-cols-[180px_1fr]">
            <p class="text-[14px] text-black/45">{item.year}</p>
            <div><h3 class="text-[21px] font-semibold">{item.institution}</h3><p class="mt-1 text-[16px] text-black/62">{item.program}</p><p class="mt-3 max-w-3xl text-[14px] leading-6 text-black/55">{item.description}</p></div>
          </article>
        {/each}
      </div>
    </section>
  </PageShell>
</main>
