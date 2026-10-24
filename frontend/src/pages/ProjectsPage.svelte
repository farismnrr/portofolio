<script lang="ts">
  import { projects } from '../lib/project-content';
  import type { ProjectDocument } from '../lib/project-content';
  import { pageCopy } from '../lib/structured-content';
  import ProjectCard from '../lib/ui/ProjectCard.svelte';
  import ProjectModal from '../lib/ui/ProjectModal.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';

  let modal: ProjectModal;

  function selectProject(project: ProjectDocument, trigger: HTMLButtonElement) {
    modal.open(project, trigger);
  }
</script>

<main>
  <PageShell className="py-12 sm:py-14 lg:py-16">
    <div class="mx-auto w-full max-w-[1280px]">
      <header class="max-w-3xl">
        <h1 class="text-4xl font-semibold leading-[1.06] tracking-[-0.035em] text-base-content sm:text-5xl">{pageCopy.projects.title}</h1>
        <p class="mt-4 max-w-[68ch] text-base leading-7 text-base-content/70">{pageCopy.projects.description}</p>
      </header>
      <div class="divider my-8 sm:my-10"></div>
      <section class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3" aria-label="Project list">
        {#each projects as project (project.slug)}
          <ProjectCard {project} onSelect={selectProject}/>
        {/each}
      </section>
    </div>
  </PageShell>
</main>
<ProjectModal bind:this={modal}/>
