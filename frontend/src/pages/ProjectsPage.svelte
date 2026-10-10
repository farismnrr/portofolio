<script lang="ts">
  import { projects } from '../lib/project-content';
  import { pageCopy } from '../lib/structured-content';
  import ProjectCard from '../lib/ui/ProjectCard.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-10 sm:py-12 lg:py-16">
    <header class="border-b border-black/10 pb-7 sm:pb-8">
      <h1 class="text-[36px] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-[42px] md:text-[54px]">{pageCopy.projects.title}</h1>
      <p class="mt-4 hyphens-auto text-justify text-[15px] leading-7 text-black/58 sm:text-[16px]">{pageCopy.projects.description}</p>
    </header>

    <section class="mt-8 grid gap-x-8 gap-y-10 sm:mt-9 sm:gap-x-10 sm:gap-y-12 md:grid-cols-2">
      {#each projects as project}<ProjectCard {project}/>{/each}
    </section>
  </PageShell>
</main>
