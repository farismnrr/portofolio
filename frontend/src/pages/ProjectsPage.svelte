<script lang="ts">
  import { projects } from '../lib/project-content';
  import { pageCopy } from '../lib/structured-content';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import ProjectCard from '../lib/ui/ProjectCard.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <div class="border-b border-black/10 pb-10">
      <PageIntro eyebrow={pageCopy.projects.eyebrow} title={pageCopy.projects.title} subtitle={pageCopy.projects.subtitle} description={pageCopy.projects.description} compact/>
      <div class="mt-7 flex max-w-[66ch] flex-wrap items-start gap-x-6 gap-y-2 text-[13px] leading-6 text-black/52">
        <span class="shrink-0 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">{projects.length} projects</span>
        <p class="min-w-0 flex-1">{pageCopy.projects.body}</p>
      </div>
    </div>

    <section class="mt-8 space-y-10">
      <ProjectCard project={projects[0]} featured/>
      <div class="grid gap-x-10 gap-y-12 md:grid-cols-2">
        {#each projects.slice(1) as project}<ProjectCard {project}/>{/each}
      </div>
    </section>
  </PageShell>
</main>
