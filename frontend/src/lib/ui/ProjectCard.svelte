<script lang="ts">
  import TechChips from './TechChips.svelte';
  import MediaImage from './MediaImage.svelte';
  import { navigate } from '../router';
  import { prefetchRoute } from '../routes';
  export let project:any;
  export let featured=false;
  const detailPath = '/projects/meeting-intelligence-platform';
</script>

<article class={featured ? "grid gap-10 border-b border-black/10 pb-10 lg:grid-cols-[1.45fr_.65fr]" : "border-b border-black/10 pb-9"}>
  <a href={detailPath} on:mouseenter={()=>prefetchRoute(detailPath)} on:focus={()=>prefetchRoute(detailPath)} on:click={(e)=>navigate(e,detailPath)} class="block">
    <MediaImage className="aspect-[1.78] w-full" src={project.image} alt={project.title}/>
  </a>
  <div class={featured ? "self-center py-3" : "pt-4"}>
    <p class="text-[11px] uppercase tracking-[0.18em] text-black/43">{project.id} / {project.year}</p>
    <h2 class="mt-2 text-[25px] font-semibold leading-tight tracking-[-0.03em]">{project.title}</h2>
    {#if project.subtitle}<p class="mt-1 text-[17px] text-black/55">{project.subtitle}</p>{/if}
    <p class="mt-3 max-w-2xl text-[14px] leading-6 text-black/55">{project.description}</p>
    <div class="mt-3 grid grid-cols-[48px_1fr] text-[11px]"><span class="text-black/35">Role</span><span class="text-black/55">{project.role}</span></div>
    <div class="mt-2 grid grid-cols-[48px_1fr]"><span class="text-[11px] text-black/35">Tech</span><TechChips items={project.tech}/></div>
    {#if featured}<a class="btn btn-neutral btn-sm mt-7 rounded-none border-0 bg-[#354536] px-7 font-normal text-white hover:bg-[#263427]" href={detailPath} on:mouseenter={()=>prefetchRoute(detailPath)} on:click={(e)=>navigate(e,detailPath)}>View project →</a>{/if}
  </div>
</article>
