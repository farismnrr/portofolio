<script lang="ts">
  import type { ProjectDocument } from '../project-content';
  import MediaImage from './MediaImage.svelte';
  import TechChips from './TechChips.svelte';
  export let project: ProjectDocument;
</script>

<section class="grid gap-12 border-b border-black/10 pb-12 lg:grid-cols-[.72fr_1.28fr]">
  <div class="self-center">
    <p class="text-[11px] uppercase tracking-[.2em] text-black/45">{project.year} · {project.category}</p>
    <h1 class="mt-5 text-[52px] font-semibold leading-[1] tracking-[-0.045em] md:text-[64px]">{project.title}</h1>
    <p class="mt-3 text-[27px] font-light leading-tight text-black/58">{project.subtitle}</p>
    <p class="mt-4 text-[13px] text-black/48">{project.role}</p>
    <p class="mt-6 max-w-xl text-[15px] leading-7 text-black/57">{project.description}</p>
    {#if project.productUrl || project.repoUrl}
      <div class="mt-7 flex flex-wrap gap-3">
        {#if project.productUrl}<a class="btn btn-neutral rounded-none border-0 bg-[#344534] px-7 font-normal" href={project.productUrl}>Visit Product ↗</a>{/if}
        {#if project.repoUrl}<a class="btn btn-outline rounded-none border-black/20 px-7 font-normal" href={project.repoUrl}>View Code ↗</a>{/if}
      </div>
    {/if}
    <div class="mt-7 border-t border-black/10 pt-5"><TechChips items={project.tech} pills/></div>
  </div>
  <MediaImage className="aspect-[1.72] w-full" src={project.image} alt={project.cardTitle} eager/>
</section>
