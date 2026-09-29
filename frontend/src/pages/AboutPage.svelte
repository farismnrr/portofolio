<script lang="ts">
  import AppIcon from '../lib/ui/AppIcon.svelte';
  import { experiences, pageCopy, profile } from '../lib/structured-content';
  import { renderMarkdown } from '../lib/markdown';
  import TimelineEntry from '../lib/ui/TimelineEntry.svelte';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
  import MarkdownArticle from '../lib/ui/MarkdownArticle.svelte';

  const page = pageCopy.about;
  const rendered = renderMarkdown(page.body);
  const selectedExperience = experiences.slice(0, 2);
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <div class="grid gap-12 lg:grid-cols-[300px_1fr] lg:gap-16">
      <aside class="lg:border-r lg:border-black/10 lg:pr-10">
        <MediaImage className="aspect-[.8] w-full" src={profile.image} alt={profile.name}/>
        <h2 class="mt-6 text-[34px] font-semibold tracking-[-0.04em]">{profile.name}</h2>
        <p class="mt-1 text-[18px] text-black/55">{profile.role}</p>
        <div class="mt-8 space-y-4 text-[14px] text-black/62">
          <p class="flex items-center gap-3"><AppIcon name="map-pin" size={17}/>{profile.location}</p>
          <p class="flex items-center gap-3"><AppIcon name="globe" size={17}/>{profile.languages}</p>
        </div>
        <div class="my-8 h-px bg-black/10"></div>
        <div class="space-y-4 text-[14px]">
          <a class="flex items-center gap-3 hover:opacity-60" href={profile.github}><AppIcon name="github" size={18}/>GitHub</a>
          <a class="flex items-center gap-3 hover:opacity-60" href={profile.linkedin}><AppIcon name="linkedin" size={18}/>LinkedIn</a>
          <a class="flex items-center gap-3 hover:opacity-60" href={profile.email}><AppIcon name="mail" size={18}/>Email</a>
          <a class="flex items-center gap-3 hover:opacity-60" href={profile.resume}><AppIcon name="file-text" size={18}/>Download Resume</a>
        </div>
      </aside>

      <section>
        <PageIntro eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} description={page.description}/>
        <div class="mt-8 max-w-5xl"><MarkdownArticle html={rendered.html} hasMermaid={rendered.hasMermaid}/></div>

        <div class="mt-10 border-t border-black/10 pt-7">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/48">Work experience</p>
            <a class="text-[12px] text-black/70 underline underline-offset-4" href="/experience">View full experience →</a>
          </div>
          {#each selectedExperience as item, i}<TimelineEntry {item} first={i===0} last={i===selectedExperience.length-1}/>{/each}
        </div>
      </section>
    </div>
  </PageShell>
</main>
