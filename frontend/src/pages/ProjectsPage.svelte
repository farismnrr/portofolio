<script lang="ts">
  import { projects } from '../lib/project-content';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import ProjectCard from '../lib/ui/ProjectCard.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <div class="grid gap-12 border-b border-black/10 pb-10 lg:grid-cols-[1fr_320px]">
      <PageIntro eyebrow="Selected work" title="Projects" subtitle="Real systems. Real impact." description="A collection of software systems I’ve designed, built, and shipped across backend infrastructure, intelligent systems, cloud platforms, and connected devices." compact/>
      <div class="self-end pb-2"><p class="text-[11px] uppercase tracking-[0.2em] text-black/45">{String(projects.length).padStart(2, "0")} Projects</p><p class="mt-4 text-[14px] leading-6 text-black/55">Each project is a long-form engineering case study backed by repository-local Markdown, so the content can grow without growing the page component.</p></div>
    </div>

    <section class="mt-8 space-y-10">
      <ProjectCard project={projects[0]} featured/>
      <div class="grid gap-x-10 gap-y-12 md:grid-cols-2">
        {#each projects.slice(1) as project}<ProjectCard {project}/>{/each}
      </div>
    </section>
  </PageShell>
</main>
