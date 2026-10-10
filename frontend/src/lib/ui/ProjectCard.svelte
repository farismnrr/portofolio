<script lang="ts">
  import type { ProjectDocument } from '../project-content';
  import MediaImage from './MediaImage.svelte';
  import { navigate } from '../router';
  import { prefetchRoute } from '../routes';

  export let project: ProjectDocument;

  $: detailPath = '/projects/' + project.slug;
  $: preserveShowcase = project.slug === 'parentify';
</script>

<article class="border-b border-black/14 pb-8 sm:pb-9">
  <a
    href={detailPath}
    on:mouseenter={()=>prefetchRoute(detailPath)}
    on:focus={()=>prefetchRoute(detailPath)}
    on:click={(e)=>navigate(e,detailPath)}
    class="block"
  >
    <MediaImage
      className={preserveShowcase ? "aspect-video w-full" : "aspect-[1.78] w-full"}
      src={project.image}
      alt={project.cardTitle}
      fit={preserveShowcase ? 'contain' : 'cover'}
    />
  </a>

  <div class="pt-4">
    <div class="flex items-start justify-between gap-4 sm:items-baseline">
      <h2 class="text-[22px] font-semibold leading-tight tracking-[-0.025em] sm:text-[24px]">
        <a
          class="hover:opacity-70"
          href={detailPath}
          on:mouseenter={()=>prefetchRoute(detailPath)}
          on:focus={()=>prefetchRoute(detailPath)}
          on:click={(e)=>navigate(e,detailPath)}
        >{project.cardTitle}</a>
      </h2>
      <p class="shrink-0 pt-1 text-[12px] text-black/58 sm:pt-0">{project.year}</p>
    </div>

    <p class="mt-3 line-clamp-3 text-[14px] leading-6 text-black/60 sm:line-clamp-2">{project.description}</p>

    <a
      class="mt-3 inline-flex min-h-10 items-center text-[12px] font-medium text-[var(--accent)] underline decoration-current/35 underline-offset-4 hover:text-black sm:mt-4"
      href={detailPath}
      on:mouseenter={()=>prefetchRoute(detailPath)}
      on:focus={()=>prefetchRoute(detailPath)}
      on:click={(e)=>navigate(e,detailPath)}
    >View project →</a>
  </div>
</article>
