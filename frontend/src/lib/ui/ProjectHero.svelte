<script lang="ts">
  import type { ProjectDocument } from '../project-content';
  import MediaImage from './MediaImage.svelte';

  export let project: ProjectDocument;
  $: preserveShowcase = project.slug === 'parentify';
</script>

<section class="border-b border-black/10 pb-12">
  <div class="grid gap-10 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] lg:items-end lg:gap-14">
    <div>
      <p class="text-[12px] text-black/44">{project.year} · {project.category}</p>
      <h1 class="mt-4 text-balance text-[44px] font-semibold leading-[1.04] tracking-[-0.035em] md:text-[58px]">{project.title}</h1>
      <p class="mt-5 max-w-[64ch] hyphens-auto text-justify text-[15px] leading-7 text-black/58">{project.description}</p>

      {#if project.productUrl || project.repoUrl}
        <div class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
          {#if project.productUrl}<a class="underline decoration-black/20 underline-offset-4 hover:text-black" href={project.productUrl}>Visit product ↗</a>{/if}
          {#if project.repoUrl}<a class="underline decoration-black/20 underline-offset-4 hover:text-black" href={project.repoUrl}>View source ↗</a>{/if}
        </div>
      {/if}
    </div>

    <MediaImage
      className={preserveShowcase ? "aspect-video w-full" : "aspect-[1.72] w-full"}
      src={project.image}
      alt={project.cardTitle}
      eager
      fit={preserveShowcase ? 'contain' : 'cover'}
    />
  </div>
</section>
