<script lang="ts">
  import AppIcon from '../lib/ui/AppIcon.svelte';
  import { education, experiences, pageCopy, profile } from '../lib/structured-content';
  import { renderMarkdown } from '../lib/markdown';
  import TimelineEntry from '../lib/ui/TimelineEntry.svelte';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
  import MarkdownArticle from '../lib/ui/MarkdownArticle.svelte';

  const page = pageCopy.about;
  const rendered = renderMarkdown(page.body);
  const selectedExperience = experiences;

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
          <button
            class="flex items-center gap-3 text-left hover:opacity-60 disabled:cursor-wait disabled:opacity-45"
            type="button"
            disabled={generatingCv}
            on:click={handleSaveCv}
          >
            <AppIcon name="file-text" size={18}/>
            {generatingCv ? 'Generating CV with AI…' : 'Save CV'}
          </button>

          {#if generatingCv}
            <div
              class="cv-status rounded-2xl border p-4"
              role="status"
              aria-live="polite"
            >
              <div class="flex items-start gap-3">
                <span
                  class="mt-0.5 block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-black/15 border-t-black/70"
                  aria-hidden="true"
                ></span>
                <div>
                  <p class="text-[13px] font-semibold text-black/78">Generating CV with AI</p>
                  <p class="mt-1 text-[12px] leading-5 text-black/50">
                    Selecting verified portfolio evidence, writing the CV, and preparing the PDF.
                  </p>
                </div>
              </div>
            </div>
          {:else if cvGenerated}
            <div class="cv-status rounded-2xl border p-4" role="status">
              <p class="text-[13px] font-semibold text-black/78">CV generated with AI</p>
              <p class="mt-1 text-[12px] leading-5 text-black/50">
                Your CV was generated from verified portfolio content and downloaded.
              </p>
            </div>
          {/if}

          {#if cvError}<p class="cv-error text-[12px] leading-5">{cvError}</p>{/if}
        </div>
      </aside>

      <section>
        <PageIntro eyebrow={page.eyebrow} title={page.title} subtitle={page.subtitle} description={page.description}/>
        <div class="mt-8 max-w-5xl"><MarkdownArticle html={rendered.html} hasMermaid={rendered.hasMermaid}/></div>

        <div class="mt-10 border-t border-black/10 pt-7">
          <div class="flex items-center justify-between">
            <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/48">Work experience</p>
          </div>
          {#each selectedExperience as item, i}<TimelineEntry {item} first={i===0} last={i===selectedExperience.length-1}/>{/each}
        </div>

        <section class="mt-12 border-t border-black/10 pt-10">
          <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/48">{pageCopy.education.eyebrow}</p>
          <h2 class="mt-3 text-[30px] font-semibold tracking-[-0.035em]">{pageCopy.education.title}</h2>
          <p class="mt-2 max-w-3xl text-[15px] leading-7 text-black/55">{pageCopy.education.description}</p>
          <div class="mt-6">
            {#each education as item}
              <article class="grid gap-5 border-b border-black/10 py-7 md:grid-cols-[170px_1fr]">
                <p class="text-[14px] text-black/45">{item.year}</p>
                <div>
                  <h3 class="text-[21px] font-semibold tracking-[-0.02em]">{item.institution}</h3>
                  <p class="mt-1 text-[16px] text-black/62">{item.program}</p>
                  {#if item.description}<div class="mt-3 max-w-3xl text-[14px] leading-6 text-black/55"><MarkdownArticle html={renderMarkdown(item.description).html}/></div>{/if}
                </div>
              </article>
            {/each}
          </div>
        </section>
      </section>
    </div>
  </PageShell>
</main>
