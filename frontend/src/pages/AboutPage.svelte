<script lang="ts">
  import AppIcon from '../lib/ui/AppIcon.svelte';
  import { experiences, profileImage } from '../lib/data';
  import TimelineEntry from '../lib/ui/TimelineEntry.svelte';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <div class="grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-16">
      <aside class="lg:border-r lg:border-black/10 lg:pr-10">
        <MediaImage className="aspect-[.8] w-full" src={profileImage} alt="Alex Morgan"/>
        <h2 class="mt-6 text-[34px] font-semibold tracking-[-0.04em]">Alex Morgan</h2>
        <p class="mt-1 text-[18px] text-black/55">Software Engineer</p>
        <div class="mt-8 space-y-4 text-[14px] text-black/62">
          <p class="flex items-center gap-3"><AppIcon name="map-pin" size={17}/>Jakarta, Indonesia</p>
          <p class="flex items-center gap-3"><AppIcon name="globe" size={17}/>English, Bahasa Indonesia</p>
        </div>
        <div class="my-8 h-px bg-black/10"></div>
        <div class="space-y-4 text-[14px]">
          <a class="flex items-center gap-3 hover:opacity-60" href="https://github.com"><AppIcon name="github" size={18}/>GitHub</a>
          <a class="flex items-center gap-3 hover:opacity-60" href="https://linkedin.com"><AppIcon name="linkedin" size={18}/>LinkedIn</a>
          <a class="flex items-center gap-3 hover:opacity-60" href="mailto:hello@example.com"><AppIcon name="mail" size={18}/>Email</a>
          <a class="flex items-center gap-3 hover:opacity-60" href="/"><AppIcon name="file-text" size={18}/>Download Resume</a>
        </div>
      </aside>

      <section>
        <PageIntro eyebrow="About me" title="About" subtitle="I build systems that connect applications, infrastructure, intelligence, and real-world devices."/>
        <div class="mt-8 max-w-5xl space-y-5 text-[16px] leading-8 text-black/58">
          <p>I’m a software engineer with a focus on backend architecture, distributed systems, and applied AI. I enjoy building reliable, scalable systems that bridge the digital and physical world — from cloud infrastructure and data pipelines to intelligent services and connected devices.</p>
          <p>My work sits at the intersection of backend engineering, machine learning, and the Internet of Things. I’m motivated by complex, real-world problems and the opportunity to turn them into practical, maintainable solutions that create real value.</p>
        </div>

        <div class="mt-10 border-t border-black/10 pt-7">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/48">Work experience</p>
            <a class="text-[12px] text-black/70 underline underline-offset-4" href="/experience">View full experience →</a>
          </div>
          {#each experiences.slice(0,2) as item, i}<TimelineEntry {item} first={i===0} last={i===1}/>{/each}
        </div>
      </section>
    </div>
  </PageShell>
</main>
