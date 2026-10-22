<script lang="ts">
  import type { ProjectDocument } from '../project-content';
  import { projectImageSrcset } from '../project-content';
  import MediaImage from './MediaImage.svelte';

  export let project: ProjectDocument;
  export let onSelect: (project: ProjectDocument, trigger: HTMLButtonElement) => void;

</script>

<article class="border-b border-black/14 pb-8 sm:pb-9">
  <button
    type="button"
    class="group block w-full cursor-pointer rounded-sm text-left transition-[transform,box-shadow,background-color] duration-200 ease-out hover:-translate-y-1 hover:bg-black/[0.015] hover:shadow-[0_12px_28px_rgba(0,0,0,0.09)] active:translate-y-0 active:shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] motion-reduce:transform-none motion-reduce:transition-none"
    aria-label={`View ${project.cardTitle} details`}
    on:click={(event) => onSelect(project, event.currentTarget)}
  >
    <MediaImage
      className="aspect-video w-full"
      src={project.image}
      srcset={projectImageSrcset(project.image)}
      sizes="(min-width: 1536px) 420px, (min-width: 1024px) 31vw, (min-width: 640px) 45vw, calc(100vw - 3rem)"
      alt={project.cardTitle}
      fit="contain"
    />
    <span class="mt-4 block text-[14px] leading-6 text-black/60">{project.description}</span>
    <span class="mt-3 block text-[12px] font-medium text-black/75">{project.kind}</span>
    <span class="mt-3 inline-flex min-h-11 items-center gap-2 text-[12px] font-semibold text-[var(--accent)]">
      <span class="underline decoration-current/35 underline-offset-4 group-hover:decoration-current group-focus-visible:decoration-current">View details</span>
      <span aria-hidden="true" class="inline-block transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1 motion-reduce:transition-none">→</span>
    </span>
  </button>

  <div class="mt-2 text-[12px] leading-5">
    {#if project.site !== '-'}
      <a class="break-all text-[var(--accent)] underline decoration-current/35 underline-offset-4 hover:text-black" href={project.site} target="_blank" rel="noopener noreferrer" on:click|stopPropagation>
        {project.site}
      </a>
    {:else}
      <span class="text-black/58">-</span>
    {/if}
  </div>
</article>
