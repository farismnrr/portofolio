<script lang="ts">
  import type { ProjectDocument } from '../project-content';
  import TechChips from './TechChips.svelte';
  import MediaImage from './MediaImage.svelte';
  import { navigate } from '../router';
  import { prefetchRoute } from '../routes';
  export let project: ProjectDocument;
  export let featured=false;
  $: detailPath = '/projects/' + project.slug;
  $: preserveShowcase = project.slug === 'parentify';
  $: visibleTech = featured ? project.tech : project.tech.slice(0, 4);
</script>

<article class={featured ? "grid gap-10 border-b border-black/10 pb-10 lg:grid-cols-[1.45fr_.65fr]" : "border-b border-black/10 pb-9"}>
  <a href={detailPath} on:mouseenter={()=>prefetchRoute(detailPath)} on:focus={()=>prefetchRoute(detailPath)} on:click={(e)=>navigate(e,detailPath)} class="block">
    <MediaImage
      className={preserveShowcase ? "aspect-video w-full" : "aspect-[1.78] w-full"}
      src={project.image}
      alt={project.cardTitle}
      fit={preserveShowcase ? 'contain' : 'cover'}
    />
  </a>
  <div class={featured ? "self-center py-3" : "pt-4"}>
    <p class="text-[11px] uppercase tracking-[0.14em] text-black/43">{project.year}</p>
    <h2 class="mt-2 text-[25px] font-semibold leading-tight tracking-[-0.03em]">{project.cardTitle}</h2>
    {#if project.subtitle}<p class="mt-1 text-[16px] text-black/52">{project.subtitle}</p>{/if}
    <p class="mt-3 max-w-[66ch] text-[14px] leading-6 text-black/55">{project.description}</p>
    <p class="mt-4 text-[11px] text-black/48"><span class="text-black/32">Role</span> · {project.role}</p>
    <div class="mt-2"><TechChips items={visibleTech}/></div>
    {#if !featured && project.tech.length > visibleTech.length}<p class="mt-2 text-[10px] text-black/36">+{project.tech.length-visibleTech.length} more in case study</p>{/if}
    {#if featured}<a class="mt-7 inline-flex items-center text-[12px] font-medium text-black/72 underline underline-offset-4 hover:text-black" href={detailPath} on:mouseenter={()=>prefetchRoute(detailPath)} on:click={(e)=>navigate(e,detailPath)}>Read case study →</a>{/if}
  </div>
</article>
