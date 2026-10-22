<script lang="ts">
  import type { ProjectDocument } from '../project-content';
  import { projectImageSrcset } from '../project-content';
  import KindBadge from './KindBadge.svelte';
  import MediaImage from './MediaImage.svelte';
  import SiteLink from './SiteLink.svelte';

  export let project: ProjectDocument;
  export let onSelect: (project: ProjectDocument, trigger: HTMLButtonElement) => void;
</script>

<article class="card group relative isolate overflow-hidden rounded-xl border border-base-300 bg-base-100 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-primary hover:shadow-lg active:translate-y-0 active:shadow-sm motion-reduce:transform-none motion-reduce:transition-none">
  <button
    type="button"
    class="absolute inset-0 z-0 h-full w-full cursor-pointer appearance-none rounded-xl border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    aria-label={`View ${project.cardTitle} details`}
    on:click={(event) => onSelect(project, event.currentTarget)}
  ></button>
  <figure class="aspect-video w-full overflow-hidden rounded-md border-b border-base-300 bg-base-200">
    <MediaImage
      className="aspect-video w-full"
      src={project.image}
      srcset={projectImageSrcset(project.image)}
      sizes="(min-width: 1280px) 380px, (min-width: 768px) 46vw, calc(100vw - 2.5rem)"
      alt={project.cardTitle}
      fit="contain"
    />
  </figure>
  <div class="card-body gap-0 p-5 sm:p-6">
    <h2 class="text-lg font-semibold leading-snug tracking-tight text-base-content">{project.cardTitle}</h2>
    <p class="mt-2 line-clamp-3 text-sm leading-6 text-base-content/70">{project.description || '-'}</p>
    <div class="mt-4 flex min-h-6 items-center">
      <KindBadge kind={project.kind}/>
    </div>
    <div class="mt-3 min-h-11 border-t border-base-300 pt-2">
      <SiteLink site={project.site}/>
    </div>
    <span class="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary" aria-hidden="true">
      <span class="underline decoration-primary/40 underline-offset-4 transition group-hover:decoration-current group-focus-within:decoration-current">View details</span>
      <span class="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">→</span>
    </span>
  </div>
</article>
