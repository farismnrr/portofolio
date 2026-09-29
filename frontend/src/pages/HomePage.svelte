<script lang="ts">
  import AppIcon from '../lib/ui/AppIcon.svelte';
  import { getLatestExperiences, pageCopy, profile } from '../lib/structured-content';
  import { getLatestProjects } from '../lib/project-content';
  import { navigate } from '../lib/router';
  import PageShell from '../lib/ui/PageShell.svelte';
  import ProjectCard from '../lib/ui/ProjectCard.svelte';
  import SectionHeader from '../lib/ui/SectionHeader.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
  import { renderMarkdown } from '../lib/markdown';
  import MarkdownArticle from '../lib/ui/MarkdownArticle.svelte';

  const selectedExperiences = getLatestExperiences(3);
  const latestProjects = getLatestProjects(4);
  const page = pageCopy.home;
  const about = renderMarkdown(page.body);
</script>

<main>
  <PageShell>
    <section class="grid gap-12 py-16 lg:grid-cols-[1.04fr_.96fr] lg:gap-24 lg:py-20">
      <div class="self-center">
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/48">{profile.specialties}</p>
        <h1 class="mt-6 text-[54px] font-semibold leading-[.98] tracking-[-0.05em] md:text-[68px]">{profile.name}</h1>
        <p class="mt-4 max-w-[760px] text-[38px] font-light leading-[1.04] tracking-[-0.035em] text-black/64 md:text-[54px]">{profile.headline}</p>
        <p class="mt-6 max-w-[680px] text-[16px] leading-7 text-black/56">{profile.intro}</p>

        <div class="mt-8 flex flex-wrap gap-4">
          <a class="btn btn-neutral h-12 min-h-0 rounded-none border-0 bg-[#344534] px-7 text-[14px] font-normal text-white hover:bg-[#263526]" href="/projects" on:click={(e)=>navigate(e,'/projects')}>{page.primaryAction} <span class="ml-2">→</span></a>
          <a class="btn btn-outline h-12 min-h-0 rounded-none border-black/20 px-8 text-[14px] font-normal hover:bg-black hover:text-white" href={profile.email}>{page.secondaryAction}</a>
        </div>

        <div class="mt-8 flex flex-wrap gap-x-9 gap-y-3 border-t border-black/10 pt-5 text-[12px] text-black/55">
          <span class="flex items-center gap-2"><AppIcon name="map-pin" size={15}/>{profile.location}</span>
          <span class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-[#45664a]"></span>{profile.availability}</span>
        </div>

        <div class="mt-6 flex flex-wrap gap-6 text-[12px] text-black/72">
          <a class="flex items-center gap-2 hover:text-black" href={profile.github}><AppIcon name="github" size={16}/>GitHub</a>
          <a class="flex items-center gap-2 hover:text-black" href={profile.linkedin}><AppIcon name="linkedin" size={16}/>LinkedIn</a>
          <a class="flex items-center gap-2 hover:text-black" href={profile.email}><AppIcon name="mail" size={16}/>Email</a>
        </div>
      </div>

      <div>
        <MediaImage className="aspect-[1.36] w-full" src={profile.image} alt={profile.name} eager/>
        <blockquote class="ml-auto mt-7 w-fit border-l border-black/15 pl-5 text-right text-[15px] leading-5 text-black/48">“{profile.quote}”</blockquote>
      </div>
    </section>

    <section class="border-t border-black/10 py-10">
      <SectionHeader eyebrow={page.experienceLabel ?? ''} action={page.experienceAction ?? ''} href="/experience"/>
      <div>
        {#each selectedExperiences as item, i}
          <article class="grid min-h-[108px] gap-4 border-b border-black/[0.08] py-6 md:grid-cols-[170px_44px_1fr_1.5fr]">
            <p class="pt-1 text-[13px] text-black/43">{item.year}</p>
            <div class="relative hidden md:block">
              <span class={"absolute left-[6px] top-[6px] h-[9px] w-[9px] rounded-full border " + (i===0 ? "border-[#38503a] bg-[#38503a]" : "border-black/45 bg-[#f8f8f6]")}></span>
              {#if i<selectedExperiences.length-1}<span class="absolute left-[10px] top-[15px] h-[116px] w-px bg-black/12"></span>{/if}
            </div>
            <div><h3 class="text-[17px] font-semibold">{item.role}</h3><p class="mt-1 text-[13px] text-black/45">{item.company}</p></div>
            <p class="max-w-[650px] text-[14px] leading-6 text-black/52">{item.summary}</p>
          </article>
        {/each}
      </div>
    </section>

    <section class="border-t border-black/10 py-10">
      <SectionHeader eyebrow={page.projectsLabel ?? ''} action={page.projectsAction ?? ''} href="/projects"/>
      <div class="grid gap-x-10 gap-y-12 md:grid-cols-2">
        {#each latestProjects as project}<ProjectCard {project}/>{/each}
      </div>
    </section>

    <section class="grid gap-10 border-t border-black/10 py-10 md:grid-cols-[.85fr_1.15fr]">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/48">{page.aboutLabel}</p>
        <h2 class="mt-5 text-[31px] font-light leading-[1.12] tracking-[-0.03em] text-black/78">{page.subtitle}</h2>
      </div>
      <div class="max-w-2xl self-end text-[14px] leading-6 text-black/56">
        <MarkdownArticle html={about.html} hasMermaid={about.hasMermaid}/>
        <a class="mt-4 inline-block text-[12px] text-black/70 underline underline-offset-4" href="/about" on:click={(e)=>navigate(e,'/about')}>{page.aboutAction} →</a>
      </div>
    </section>
  </PageShell>
</main>
