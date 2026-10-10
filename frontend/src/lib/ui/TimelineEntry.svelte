<script lang="ts">
  import { certificationGroupId, certificationGroups } from '../structured-content';
  import { getProjectBySlug } from '../project-content';
  import { renderInlineMarkdown } from '../markdown';
  import { navigate } from '../router';
  import TechChips from './TechChips.svelte';

  export let item:any;
  export let compact=false;
  export let first=false;
  export let last=false;
  export let wide=false;

  $: linkedProjects = (item.projects ?? []).flatMap((slug:string) => {
    const project = getProjectBySlug(slug);
    return project ? [project] : [];
  });

  $: linkedCertificationGroups = (item.certificationGroups ?? []).flatMap((name:string) => {
    const group = certificationGroups.find((candidate) => candidate.group === name);
    return group ? [group] : [];
  });
</script>

<article class="grid gap-4 border-b border-black/10 py-7 sm:gap-5 sm:py-8 md:grid-cols-[150px_34px_1fr] lg:grid-cols-[170px_42px_1fr] lg:py-10 2xl:grid-cols-[190px_48px_minmax(0,1fr)] 2xl:gap-6 2xl:py-12">
  <p class="pt-0.5 text-[13px] text-black/48 sm:text-[14px] md:pt-1 2xl:text-[15px]">{item.year}</p>
  <div class="relative hidden md:block">
    {#if !first}<span class="absolute left-[9px] top-[-2.5rem] h-[2.8rem] w-px bg-black/12"></span>{/if}
    <span class={"absolute left-[5px] top-[7px] h-[9px] w-[9px] rounded-full border " + (first ? "border-[#334734] bg-[#334734]" : "border-black/55 bg-[var(--page-bg)]")}></span>
    {#if !last}<span class="absolute left-[9px] top-[17px] h-[calc(100%+2.5rem)] w-px bg-black/12"></span>{/if}
  </div>
  <div class={wide ? "max-w-none" : "max-w-4xl"}>
    <h3 class="text-[20px] font-semibold tracking-[-0.025em] sm:text-[22px] 2xl:text-[24px]">{item.company}</h3>
    <p class="mt-1 text-[15px] text-black/62 sm:text-[16px] 2xl:text-[17px]">{item.role}</p>
    {#if item.location}<p class="mt-1 text-[13px] text-black/42 2xl:text-[14px]">{item.location}</p>{/if}
    <p class={wide ? "mt-4 hyphens-auto text-left text-[14px] leading-6 text-black/58 sm:mt-5 sm:text-justify sm:text-[15px] sm:leading-7 2xl:text-[16px] 2xl:leading-8" : "mt-4 text-[14px] leading-6 text-black/58 sm:mt-5 sm:text-[15px] sm:leading-7 2xl:text-[16px] 2xl:leading-8"}>{item.summary}</p>

    {#if linkedProjects.length || linkedCertificationGroups.length}
      <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] sm:mt-4 sm:gap-x-4 sm:gap-y-2 2xl:text-[14px]">
        {#if linkedProjects.length}
          <span class="text-black/40">Related project</span>
          {#each linkedProjects as project}
            <a
              class="inline-flex min-h-11 items-center font-medium text-[var(--accent)] underline decoration-black/20 underline-offset-4 transition hover:decoration-current"
              href={'/projects/' + project.slug}
              on:click={(event)=>navigate(event, '/projects/' + project.slug)}
            >{project.cardTitle} →</a>
          {/each}
        {/if}

        {#if linkedCertificationGroups.length}
          <span class="text-black/40">Related certifications</span>
          {#each linkedCertificationGroups as group}
            <a
              class="inline-flex min-h-11 items-center font-medium text-[var(--accent)] underline decoration-black/20 underline-offset-4 transition hover:decoration-current"
              href={'/certifications#' + certificationGroupId(group.group)}
            >{group.group} ({group.items.length}) →</a>
          {/each}
        {/if}
      </div>
    {/if}

    {#if !compact}
      <ul class={wide ? "mt-3 list-disc space-y-2 pl-5 hyphens-auto text-left text-[14px] leading-6 text-black/58 sm:mt-4 sm:text-justify 2xl:text-[15px] 2xl:leading-7" : "mt-3 list-disc space-y-2 pl-5 text-[14px] leading-6 text-black/58 sm:mt-4 2xl:text-[15px] 2xl:leading-7"}>
        {#each item.bullets as bullet}
          <li class="[&_a]:text-[var(--accent)] [&_a]:underline [&_a]:underline-offset-4 [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[0.92em] [&_strong]:font-semibold [&_strong]:text-black/75">
            {@html renderInlineMarkdown(bullet)}
          </li>
        {/each}
      </ul>
      {#if !wide}<div class="mt-5"><TechChips items={item.tech} pills/></div>{/if}
    {/if}
  </div>
</article>
