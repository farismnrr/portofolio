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
  <PageShell className="py-12">
    <a class="flex items-center gap-2 text-[12px] text-black/55 hover:text-black" href="/projects"><AppIcon name="arrow-left" size={14}/>Projects</a>
    {#if project && rendered}
      <div class="mt-8"><ProjectHero {project}/></div>
      <section class="grid gap-9 py-10 lg:grid-cols-[150px_minmax(0,1fr)] xl:gap-12">
        <ContentToc items={rendered.toc}/>
        <div class="min-w-0">{#key project.slug}<MarkdownArticle html={rendered.html} hasMermaid={rendered.hasMermaid}/>{/key}</div>
      </section>
    {:else}
      <section class="py-24">
        <p class="text-[11px] uppercase tracking-[.2em] text-black/45">Project not found</p>
        <h1 class="mt-4 text-[44px] font-semibold tracking-[-0.04em]">This case study does not exist.</h1>
        <a class="mt-6 inline-block text-[13px] underline underline-offset-4" href="/projects">Back to projects →</a>
      </section>
    {/if}
  </PageShell>
</main>
