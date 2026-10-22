<script lang="ts">
  import type { ProjectDocument } from '../project-content';
  import { isUncroppedCover, projectImageSrcset } from '../project-content';
  import MediaImage from './MediaImage.svelte';

  export let project: ProjectDocument;
  export let onSelect: (project: ProjectDocument, trigger: HTMLButtonElement) => void;

  $: preserveShowcase = isUncroppedCover(project.slug);
</script>

<article class="border-b border-black/14 pb-8 sm:pb-9">
  <button
    type="button"
    class="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
    aria-label={`View ${project.cardTitle} details`}
    on:click={(event) => onSelect(project, event.currentTarget)}
  >
    <MediaImage
      className={preserveShowcase ? 'aspect-[4/3] w-full' : 'aspect-[4/3] w-full'}
      src={project.image}
      srcset={projectImageSrcset(project.image)}
      sizes="(min-width: 1536px) 420px, (min-width: 1024px) 31vw, (min-width: 640px) 45vw, calc(100vw - 3rem)"
      alt={project.cardTitle}
      fit={preserveShowcase ? 'contain' : 'cover'}
    />
    <span class="mt-4 block text-[14px] leading-6 text-black/60">{project.description}</span>
    <span class="mt-3 block text-[12px] font-medium text-black/75">{project.kind}</span>
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
