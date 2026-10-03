<script lang="ts">
  import { getProjectBySlug } from '../project-content';
  import { navigate } from '../router';
  import TechChips from './TechChips.svelte';

  export let item:any;
  export let compact=false;
  export let first=false;
  export let last=false;

  $: linkedProjects = (item.projects ?? []).flatMap((slug:string) => {
    const project = getProjectBySlug(slug);
    return project ? [project] : [];
  });
</script>

<article class="grid gap-5 border-b border-black/10 py-8 md:grid-cols-[170px_42px_1fr] lg:py-10">
  <p class="pt-1 text-[14px] text-black/48">{item.year}</p>
  <div class="relative hidden md:block">
    {#if !first}<span class="absolute left-[9px] top-[-2.5rem] h-[2.8rem] w-px bg-black/12"></span>{/if}
    <span class={"absolute left-[5px] top-[7px] h-[9px] w-[9px] rounded-full border " + (first ? "border-[#334734] bg-[#334734]" : "border-black/55 bg-[var(--page-bg)]")}></span>
    {#if !last}<span class="absolute left-[9px] top-[17px] h-[calc(100%+2.5rem)] w-px bg-black/12"></span>{/if}
  </div>
  <div class="max-w-4xl">
    <h3 class="text-[22px] font-semibold tracking-[-0.025em]">{item.company}</h3>
    <p class="mt-1 text-[16px] text-black/62">{item.role}</p>
    {#if item.location}<p class="mt-1 text-[13px] text-black/42">{item.location}</p>{/if}
    <p class="mt-5 text-[15px] leading-7 text-black/58">{item.summary}</p>

    {#if linkedProjects.length}
      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
        <span class="text-black/40">Related project</span>
        {#each linkedProjects as project}
          <a
            class="font-medium text-[var(--accent)] underline decoration-black/20 underline-offset-4 transition hover:decoration-current"
            href={'/projects/' + project.slug}
            on:click={(event)=>navigate(event, '/projects/' + project.slug)}
          >{project.cardTitle} →</a>
        {/each}
      </div>
    {/if}

    {#if !compact}
      <ul class="mt-4 list-disc space-y-2 pl-5 text-[14px] leading-6 text-black/58">
        {#each item.bullets as bullet}<li>{bullet}</li>{/each}
      </ul>
      <div class="mt-5"><TechChips items={item.tech} pills/></div>
    {/if}
  </div>
</article>
