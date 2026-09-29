<script lang="ts">
  import { projects } from '../lib/project-content';
  import { pageCopy } from '../lib/structured-content';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import ProjectCard from '../lib/ui/ProjectCard.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <div class="grid gap-12 border-b border-black/10 pb-10 lg:grid-cols-[1fr_320px]">
      <PageIntro eyebrow={pageCopy.projects.eyebrow} title={pageCopy.projects.title} subtitle={pageCopy.projects.subtitle} description={pageCopy.projects.description} compact/>
      <div class="self-end pb-2"><p class="text-[11px] uppercase tracking-[0.2em] text-black/45">{String(projects.length).padStart(2, "0")} Projects</p><p class="mt-4 text-[14px] leading-6 text-black/55">{pageCopy.projects.body}</p></div>
    </div>

    <section class="mt-8 space-y-10">
      <ProjectCard project={projects[0]} featured/>
      <div class="grid gap-x-10 gap-y-12 md:grid-cols-2">
        {#each projects.slice(1) as project}<ProjectCard {project}/>{/each}
      </div>
    </section>
  </PageShell>
</main>
