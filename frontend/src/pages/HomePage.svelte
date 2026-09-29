<script lang="ts">
  import AppIcon from '../lib/ui/AppIcon.svelte';
  import { getLatestExperiences } from '../lib/structured-content';
  import { getLatestProjects } from '../lib/project-content';
  import { navigate } from '../lib/router';
  import PageShell from '../lib/ui/PageShell.svelte';
  import ProjectCard from '../lib/ui/ProjectCard.svelte';
  import SectionHeader from '../lib/ui/SectionHeader.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';

  const selectedExperiences = getLatestExperiences(3);
  const latestProjects = getLatestProjects(4);
  const profileImage = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1400&q=85';
</script>

<main>
  <PageShell>
    <section class="grid gap-12 py-16 lg:grid-cols-[1.04fr_.96fr] lg:gap-24 lg:py-20">
      <div class="self-center">
        <p class="text-[11px] font-semibold uppercase tracking-[0.24em] text-black/48">Software Engineer · Backend · AI · IoT</p>
        <h1 class="mt-6 text-[54px] font-semibold leading-[.98] tracking-[-0.05em] md:text-[68px]">Alex Morgan</h1>
        <p class="mt-4 max-w-[760px] text-[38px] font-light leading-[1.04] tracking-[-0.035em] text-black/64 md:text-[54px]">Building reliable systems<br/>for complex problems.</p>
        <p class="mt-6 max-w-[680px] text-[16px] leading-7 text-black/56">A software engineer working across backend architecture, intelligent systems, cloud infrastructure, and connected devices.</p>

        <div class="mt-8 flex flex-wrap gap-4">
          <a class="btn btn-neutral h-12 min-h-0 rounded-none border-0 bg-[#344534] px-7 text-[14px] font-normal text-white hover:bg-[#263526]" href="/projects" on:click={(e)=>navigate(e,'/projects')}>View Projects <span class="ml-2">→</span></a>
          <a class="btn btn-outline h-12 min-h-0 rounded-none border-black/20 px-8 text-[14px] font-normal hover:bg-black hover:text-white" href="mailto:hello@example.com">Contact</a>
        </div>

        <div class="mt-8 flex flex-wrap gap-x-9 gap-y-3 border-t border-black/10 pt-5 text-[12px] text-black/55">
          <span class="flex items-center gap-2"><AppIcon name="map-pin" size={15}/>Jakarta, Indonesia</span>
          <span class="flex items-center gap-2"><span class="h-2 w-2 rounded-full bg-[#45664a]"></span>Available for selected opportunities</span>
        </div>

        <div class="mt-6 flex flex-wrap gap-6 text-[12px] text-black/72">
          <a class="flex items-center gap-2 hover:text-black" href="https://github.com"><AppIcon name="github" size={16}/>GitHub</a>
          <a class="flex items-center gap-2 hover:text-black" href="https://linkedin.com"><AppIcon name="linkedin" size={16}/>LinkedIn</a>
          <a class="flex items-center gap-2 hover:text-black" href="mailto:hello@example.com"><AppIcon name="mail" size={16}/>Email</a>
        </div>
      </div>

      <div>
        <MediaImage className="aspect-[1.36] w-full" src={profileImage} alt="Alex Morgan" eager/>
        <blockquote class="ml-auto mt-7 w-fit border-l border-black/15 pl-5 text-right text-[15px] leading-5 text-black/48">“Better systems create<br/>more possibilities.”</blockquote>
      </div>
    </section>

    <section class="border-t border-black/10 py-10">
      <SectionHeader eyebrow="Selected experience" action="View full experience" href="/experience"/>
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
      <SectionHeader eyebrow="Selected projects" action="View all projects" href="/projects"/>
      <div class="grid gap-x-10 gap-y-12 md:grid-cols-2">
        {#each latestProjects as project}<ProjectCard {project}/>{/each}
      </div>
    </section>

    <section class="grid gap-10 border-t border-black/10 py-10 md:grid-cols-[.85fr_1.15fr]">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/48">About</p>
        <h2 class="mt-5 text-[31px] font-light leading-[1.12] tracking-[-0.03em] text-black/78">I care about software that<br/>remains understandable<br/>after it grows.</h2>
      </div>
      <div class="max-w-2xl self-end text-[14px] leading-6 text-black/56">
        <p>I’m a software engineer who enjoys building systems at the intersection of backend infrastructure, intelligent systems, and connected devices. I value clarity, long-term thinking, and maintainable solutions.</p>
        <a class="mt-4 inline-block text-[12px] text-black/70 underline underline-offset-4" href="/about" on:click={(e)=>navigate(e,'/about')}>More about me →</a>
      </div>
    </section>
  </PageShell>
</main>
