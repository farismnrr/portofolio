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
    <section class="grid gap-12 py-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-20 lg:py-18">
      <div class="self-center">
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">{profile.specialties}</p>
        <h1 class="mt-5 text-[48px] font-semibold leading-[1] tracking-[-0.045em] md:text-[62px]">{profile.name}</h1>
        <p class="mt-4 max-w-[18ch] text-[30px] font-light leading-[1.1] tracking-[-0.025em] text-black/62 md:text-[42px]">{profile.headline}</p>
        <p class="mt-6 max-w-[62ch] text-[16px] leading-7 text-black/56">{profile.intro}</p>

        <div class="mt-8 flex flex-wrap gap-4">
          <a class="btn btn-neutral h-12 min-h-0 rounded-none border-0 bg-[#344534] px-7 text-[14px] font-normal text-white hover:bg-[#263526]" href="/projects" on:click={(e)=>navigate(e,'/projects')}>{page.primaryAction} <span class="ml-2">→</span></a>
          <a class="h-12 border-b border-black/25 px-1 text-[14px] leading-[48px] text-black/68 hover:border-black hover:text-black" href={profile.email}>{page.secondaryAction}</a>
        </div>

        <div class="mt-8 flex flex-wrap gap-x-9 gap-y-3 border-t border-black/10 pt-5 text-[12px] text-black/55">
          <span class="flex items-center gap-2"><AppIcon name="map-pin" size={15}/>{profile.location}</span>
          {#if profile.availability}<span class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-[#45664a]"></span>{profile.availability}</span>{/if}
        </div>

        <div class="mt-6 flex flex-wrap gap-6 text-[12px] text-black/72">
          <a class="flex items-center gap-2 hover:text-black" href={profile.github}><AppIcon name="github" size={16}/>GitHub</a>
          <a class="flex items-center gap-2 hover:text-black" href={profile.linkedin}><AppIcon name="linkedin" size={16}/>LinkedIn</a>
          <a class="flex items-center gap-2 hover:text-black" href={profile.email}><AppIcon name="mail" size={16}/>Email</a>
        </div>
      </div>

      <div>
        <MediaImage className="aspect-[1.36] w-full" src={profile.image} alt={profile.name} eager/>
      </div>
    </section>

    <section class="border-t border-black/10 py-10">
      <SectionHeader eyebrow={page.experienceLabel ?? ''} action={page.experienceAction ?? ''} href="/experience"/>
      <div>
        {#each selectedExperiences as item, i}
          <article class="grid min-h-[108px] gap-4 border-b border-black/[0.08] py-6 md:grid-cols-[170px_44px_1fr_1.5fr]">
            <p class="pt-1 text-[13px] text-black/43">{item.year}</p>
            <div class="relative hidden md:block">
              <span class={"absolute left-[6px] top-[6px] h-[9px] w-[9px] rounded-full border " + (i===0 ? "border-[#38503a] bg-[#38503a]" : "border-black/45 bg-[var(--page-bg)]")}></span>
              {#if i<selectedExperiences.length-1}<span class="absolute left-[10px] top-[15px] h-[116px] w-px bg-black/12"></span>{/if}
            </div>
            <div><h3 class="text-[17px] font-semibold">{item.role}</h3><p class="mt-1 text-[13px] text-black/45">{item.company}</p></div>
            <p class="max-w-[66ch] text-[14px] leading-6 text-black/52">{item.summary}</p>
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
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">{page.aboutLabel}</p>
        <h2 class="mt-5 max-w-[20ch] text-[28px] font-light leading-[1.18] tracking-[-0.025em] text-black/76">{page.subtitle}</h2>
      </div>
      <div class="max-w-[66ch] self-end text-[14px] leading-6 text-black/56">
        <MarkdownArticle html={about.html} hasMermaid={about.hasMermaid}/>
        <a class="mt-4 inline-block text-[12px] text-black/70 underline underline-offset-4" href="/about" on:click={(e)=>navigate(e,'/about')}>{page.aboutAction} →</a>
      </div>
    </section>
  </PageShell>
</main>
