<script lang="ts">
  import { projects } from '../lib/project-content';
  import { pageCopy } from '../lib/structured-content';
  import ProjectCard from '../lib/ui/ProjectCard.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <header class="border-b border-black/10 pb-8">
      <h1 class="text-[42px] font-semibold leading-[1.05] tracking-[-0.035em] md:text-[54px]">{pageCopy.projects.title}</h1>
      <p class="mt-4 max-w-[70ch] text-[16px] leading-7 text-black/58">{pageCopy.projects.description}</p>
    </header>

    <section class="mt-9 grid gap-x-10 gap-y-12 md:grid-cols-2">
      {#each projects as project}<ProjectCard {project}/>{/each}
    </section>
  </PageShell>
</main>
