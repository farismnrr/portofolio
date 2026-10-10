<script lang="ts">
  import type { ProjectDocument } from '../project-content';
  import MediaImage from './MediaImage.svelte';

  export let project: ProjectDocument;
  $: preserveShowcase = project.slug === 'parentify';
</script>

<section class="border-b border-black/14 pb-10 sm:pb-12 2xl:pb-14">
  <div class="grid gap-8 sm:gap-10 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] lg:items-end lg:gap-14 2xl:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)] 2xl:gap-20">
    <div>
      <p class="text-[12px] text-black/60 2xl:text-[13px]">{project.year} · {project.category}</p>
      <h1 class="mt-4 text-balance text-[36px] font-semibold leading-[1.06] tracking-[-0.035em] sm:text-[44px] md:text-[58px] 2xl:text-[64px]">{project.title}</h1>
      <p class="mt-5 hyphens-auto text-left text-[15px] leading-7 text-black/62 sm:text-justify 2xl:text-[16px] 2xl:leading-8">{project.description}</p>

      {#if project.productUrl || project.repoUrl}
        <div class="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[13px] sm:mt-6 sm:gap-x-6 2xl:text-[14px]">
          {#if project.productUrl}<a class="inline-flex min-h-11 items-center text-[var(--accent)] underline decoration-current/35 underline-offset-4 hover:text-black" href={project.productUrl}>Visit product ↗</a>{/if}
          {#if project.repoUrl}<a class="inline-flex min-h-11 items-center text-[var(--accent)] underline decoration-current/35 underline-offset-4 hover:text-black" href={project.repoUrl}>View source ↗</a>{/if}
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
