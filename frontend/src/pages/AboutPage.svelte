<script lang="ts">
  import AppIcon from '../lib/ui/AppIcon.svelte';
  import { education, experiences, pageCopy, profile, publications, skillGroups } from '../lib/structured-content';
  import { renderMarkdown } from '../lib/markdown';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
  import MarkdownArticle from '../lib/ui/MarkdownArticle.svelte';
  import TimelineEntry from '../lib/ui/TimelineEntry.svelte';

  const page = pageCopy.about;
  const rendered = renderMarkdown(page.body);

  let generatingCv = false;
  let cvError = '';
  let cvGenerated = false;

  async function handleSaveCv() {
    if (generatingCv) return;

    generatingCv = true;
    cvError = '';
    cvGenerated = false;

    try {
      const { generateGeneralCv } = await import('../lib/cv');
      await generateGeneralCv();
      cvGenerated = true;
    } catch (error) {
      cvError = error instanceof Error ? error.message : 'Unable to generate CV.';
    } finally {
      generatingCv = false;
    }
  }
</script>

<main>
  <PageShell className="py-12 lg:py-14">
    <div class="grid gap-10 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-14">
      <aside class="self-start lg:sticky lg:top-28 lg:border-r lg:border-black/10 lg:pr-8 xl:pr-10">
        <MediaImage className="aspect-[.8] w-full" src={profile.image} alt={profile.name}/>

        <h2 class="mt-5 text-[25px] font-semibold leading-tight tracking-[-0.025em]">{profile.name}</h2>
        <p class="mt-1 text-[15px] text-black/55">{profile.role}</p>

        <div class="mt-5 space-y-3 text-[13px] text-black/60">
          <p class="flex items-center gap-2.5"><AppIcon name="map-pin" size={15}/>{profile.location}</p>
          <p class="flex items-center gap-2.5"><AppIcon name="globe" size={15}/>{profile.languages}</p>
        </div>

        <div class="my-5 h-px bg-black/10"></div>

        <div class="space-y-3 text-[13px]">
          <a class="flex items-center gap-2.5 hover:opacity-60" href={profile.github}><AppIcon name="github" size={16}/>GitHub</a>
          <a class="flex items-center gap-2.5 hover:opacity-60" href={profile.linkedin}><AppIcon name="linkedin" size={16}/>LinkedIn</a>
          <a class="flex items-center gap-2.5 hover:opacity-60" href={profile.email}><AppIcon name="mail" size={16}/>Email</a>
          <button
            class="flex items-center gap-2.5 text-left hover:opacity-60 disabled:cursor-wait disabled:opacity-45"
            type="button"
            disabled={generatingCv}
            on:click={handleSaveCv}
          >
            <AppIcon name="file-text" size={16}/>
            {generatingCv ? 'Generating CV…' : 'Generate CV'}
          </button>

          {#if generatingCv}
            <p class="text-[12px] leading-5 text-black/45" role="status" aria-live="polite">Preparing the PDF from verified portfolio content.</p>
          {:else if cvGenerated}
            <p class="text-[12px] leading-5 text-black/45" role="status">CV generated and downloaded.</p>
          {/if}

          {#if cvError}<p class="cv-error text-[12px] leading-5">{cvError}</p>{/if}
        </div>
      </aside>

      <section class="min-w-0">
        <header class="border-b border-black/10 pb-9">
          <p class="text-[14px] font-medium text-black/48">About</p>
          <h1 class="mt-3 max-w-[24ch] text-[38px] font-semibold leading-[1.08] tracking-[-0.025em] md:text-[48px] xl:max-w-[28ch]">{page.subtitle}</h1>

          <div class="about-copy mt-7 text-[16px] leading-7 text-black/62">
            <MarkdownArticle html={rendered.html} hasMermaid={rendered.hasMermaid}/>
          </div>
        </header>

        <section class="pt-9">
          <h2 class="text-[25px] font-semibold tracking-[-0.018em]">Professional background</h2>
          <div class="mt-4 border-t border-black/10">
            {#each experiences as item, i}
              <TimelineEntry {item} first={i===0} last={i===experiences.length-1} wide/>
            {/each}
          </div>
        </section>

        <section class="mt-11 border-t border-black/10 pt-8">
          <h2 class="text-[25px] font-semibold tracking-[-0.018em]">Technical focus</h2>
          <div class="mt-6 grid gap-x-10 gap-y-7 md:grid-cols-2 xl:grid-cols-3">
            {#each skillGroups as group}
              <article class="border-t border-black/10 pt-4">
                <h3 class="text-[16px] font-medium text-black/82">{group.title}</h3>
                <p class="mt-2 text-[13px] leading-6 text-black/54">{group.items.join(', ')}</p>
              </article>
            {/each}
          </div>
        </section>

        <section class="mt-11 border-t border-black/10 pt-8">
          <h2 class="text-[25px] font-semibold tracking-[-0.018em]">Education</h2>
          <div class="mt-5 divide-y divide-black/10 border-y border-black/10">
            {#each education as item}
              <article class="grid gap-4 py-7 md:grid-cols-[170px_minmax(0,1fr)] md:gap-8">
                <p class="text-[13px] text-black/42">{item.year}</p>
                <div class="min-w-0">
                  <h3 class="text-[19px] font-semibold tracking-[-0.015em] text-black/84">{item.institution}</h3>
                  <p class="mt-1 text-[15px] text-black/58">{item.program}</p>
                  {#if item.description}
                    <div class="education-copy mt-4 text-[14px] leading-6 text-black/56">
                      <MarkdownArticle html={renderMarkdown(item.description).html}/>
                    </div>
                  {/if}
                </div>
              </article>
            {/each}
          </div>
        </section>

        {#if publications.length}
          <section class="mt-11 border-t border-black/10 pt-8">
            <h2 class="text-[25px] font-semibold tracking-[-0.018em]">Academic work</h2>
            <div class="mt-5 divide-y divide-black/10 border-y border-black/10">
              {#each publications as item}
                <article class="grid gap-4 py-7 md:grid-cols-[170px_minmax(0,1fr)] md:gap-8">
                  <div>
                    <p class="text-[13px] text-black/42">{item.year}</p>
                    <p class="mt-1 text-[11px] uppercase tracking-[0.12em] text-black/35">{item.type.replace('-', ' ')}</p>
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-[18px] font-semibold leading-7 tracking-[-0.012em] text-black/84">
                      <a class="hover:opacity-60" href={item.url}>{item.title}</a>
                    </h3>
                    <p class="mt-1 text-[13px] text-black/50">{item.venue}</p>
                    <p class="mt-3 max-w-none text-[14px] leading-6 text-black/56">{item.summary}</p>
                    {#if item.doi}
                      <a class="mt-3 inline-block text-[13px] underline decoration-black/20 underline-offset-4 hover:text-black" href={item.doi}>DOI</a>
                    {/if}
                  </div>
                </article>
              {/each}
            </div>
          </section>
        {/if}
      </section>
    </div>
  </PageShell>
</main>

<style>
  @media (min-width: 1280px) {
    .about-copy :global(.project-markdown article) {
      columns: 2;
      column-gap: 3rem;
      text-align: justify;
      text-justify: inter-word;
      hyphens: auto;
    }

    .about-copy :global(.project-markdown p) {
      break-inside: avoid;
      margin-top: 0;
      margin-bottom: 1.1rem;
    }
  }

  .education-copy :global(.project-markdown article) {
    max-width: none;
  }
</style>
