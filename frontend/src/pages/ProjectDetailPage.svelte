<script lang="ts">
  import { path } from '../lib/router';
  import { getProjectByPath } from '../lib/project-content';
  import { renderMarkdown } from '../lib/markdown';
  import AppIcon from '../lib/ui/AppIcon.svelte';
  import ContentToc from '../lib/ui/ContentToc.svelte';
  import MarkdownArticle from '../lib/ui/MarkdownArticle.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
  import ProjectHero from '../lib/ui/ProjectHero.svelte';

  $: project = getProjectByPath($path);
  $: rendered = project ? renderMarkdown(project.markdown) : null;
</script>

<main>
  <PageShell className="py-8 sm:py-10 lg:py-12 2xl:py-14">
    <a class="inline-flex min-h-11 items-center gap-2 text-[12px] text-black/55 hover:text-black" href="/projects"><AppIcon name="arrow-left" size={14}/>Projects</a>
    {#if project && rendered}
      <div class="mt-5 sm:mt-7 lg:mt-8"><ProjectHero {project}/></div>
      <section class="grid gap-8 py-8 sm:py-10 lg:grid-cols-[150px_minmax(0,1fr)] lg:gap-9 xl:gap-12 2xl:grid-cols-[190px_minmax(0,1fr)] 2xl:gap-16 2xl:py-12">
        <ContentToc items={rendered.toc}/>
        <div class="min-w-0">{#key project.slug}<MarkdownArticle html={rendered.html} hasMermaid={rendered.hasMermaid}/>{/key}</div>
      </section>
    {:else}
      <section class="py-20 sm:py-24">
        <p class="text-[11px] uppercase tracking-[.2em] text-black/45">Project not found</p>
        <h1 class="mt-4 text-[36px] font-semibold tracking-[-0.04em] sm:text-[44px]">This case study does not exist.</h1>
        <a class="mt-6 inline-flex min-h-11 items-center text-[13px] underline underline-offset-4" href="/projects">Back to projects →</a>
      </section>
    {/if}
  </PageShell>
</main>
