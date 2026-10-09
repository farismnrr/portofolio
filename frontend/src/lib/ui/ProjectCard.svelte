<script lang="ts">
  import type { ProjectDocument } from '../project-content';
  import MediaImage from './MediaImage.svelte';
  import { navigate } from '../router';
  import { prefetchRoute } from '../routes';

  export let project: ProjectDocument;
  export let featured=false;

  $: detailPath = '/projects/' + project.slug;
  $: preserveShowcase = project.slug === 'parentify';
</script>

<article class="border-b border-black/10 pb-9">
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
    <div class="flex items-baseline justify-between gap-4">
      <h2 class="text-[24px] font-semibold leading-tight tracking-[-0.025em]">
        <a
          class="hover:opacity-60"
          href={detailPath}
          on:mouseenter={()=>prefetchRoute(detailPath)}
          on:focus={()=>prefetchRoute(detailPath)}
          on:click={(e)=>navigate(e,detailPath)}
        >{project.cardTitle}</a>
      </h2>
      <p class="shrink-0 text-[12px] text-black/40">{project.year}</p>
    </div>

    <p class="mt-3 line-clamp-2 text-[14px] leading-6 text-black/56">{project.description}</p>

    <a
      class="mt-4 inline-flex text-[12px] font-medium text-black/68 underline decoration-black/20 underline-offset-4 hover:text-black"
      href={detailPath}
      on:mouseenter={()=>prefetchRoute(detailPath)}
      on:focus={()=>prefetchRoute(detailPath)}
      on:click={(e)=>navigate(e,detailPath)}
    >View project →</a>
  </div>
</article>
