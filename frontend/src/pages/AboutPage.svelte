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
  let tailorCvOpen = false;
  let jobDescription = '';
  let cvModulePromise: Promise<typeof import('../lib/cv')> | null = null;

  function preloadCv() {
    cvModulePromise ??= import('../lib/cv');
    return cvModulePromise;
  }

  async function handleSaveCv(targetJobDescription = '') {
    if (generatingCv) return;

    generatingCv = true;
    cvError = '';
    cvGenerated = false;

    try {
      const { generateGeneralCv } = await preloadCv();
      await generateGeneralCv(targetJobDescription);
      cvGenerated = true;
    } catch {
      cvError = 'Could not prepare the CV. Please try again.';
    } finally {
      generatingCv = false;
    }
  }

  async function handleTailoredCv() {
    const normalized = jobDescription.replace(/\s+/g, ' ').trim();
    if (!normalized) {
      cvError = 'Paste the job description before tailoring the CV.';
      return;
    }
    await handleSaveCv(normalized);
  }
</script>

<main>
  <PageShell className="py-10 sm:py-12 lg:py-14">
    <div class="grid gap-9 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[260px_minmax(0,1fr)] xl:gap-14 2xl:grid-cols-[280px_minmax(0,1fr)] 2xl:gap-16">
      <aside class="grid grid-cols-[112px_minmax(0,1fr)] gap-x-5 gap-y-4 self-start sm:grid-cols-[150px_minmax(0,1fr)] lg:sticky lg:top-28 lg:block lg:border-r lg:border-black/14 lg:pr-8 xl:pr-10 2xl:pr-12">
        <MediaImage className="aspect-[.8] w-full self-start" src={profile.image} alt={profile.name}/>

        <div class="min-w-0">
          <h2 class="text-[22px] font-semibold leading-tight tracking-[-0.025em] sm:text-[25px] lg:mt-5">{profile.name}</h2>
          <p class="mt-1 text-[14px] text-black/62 sm:text-[15px]">{profile.role}</p>

          <div class="mt-4 space-y-2.5 text-[12px] text-black/62 sm:mt-5 sm:text-[13px]">
            <p class="flex items-center gap-2.5"><AppIcon name="map-pin" size={15}/>{profile.location}</p>
            <p class="flex items-center gap-2.5"><AppIcon name="globe" size={15}/>{profile.languages}</p>
          </div>
        </div>

        <div class="col-span-2 grid grid-cols-2 gap-x-4 gap-y-1 border-t border-black/14 pt-3 text-[13px] sm:grid-cols-3 lg:mt-5 lg:block lg:space-y-1 lg:border-t lg:pt-4">
          <a class="flex min-h-10 items-center gap-2.5 hover:text-[var(--accent)]" href={profile.github}><AppIcon name="github" size={16}/>GitHub</a>
          <a class="flex min-h-10 items-center gap-2.5 hover:text-[var(--accent)]" href={profile.linkedin}><AppIcon name="linkedin" size={16}/>LinkedIn</a>
          <a class="flex min-h-10 items-center gap-2.5 hover:text-[var(--accent)]" href={profile.googleCloudSkills}><AppIcon name="globe" size={16}/>Google Cloud Skills</a>
          <a class="flex min-h-10 items-center gap-2.5 hover:text-[var(--accent)]" href={profile.email}><AppIcon name="mail" size={16}/>Email</a>
          <button
            class="flex min-h-10 items-center gap-2.5 text-left hover:text-[var(--accent)] disabled:cursor-wait disabled:opacity-55"
            type="button"
            disabled={generatingCv}
            on:mouseenter={() => void preloadCv()}
            on:focus={() => void preloadCv()}
            on:pointerdown={() => void preloadCv()}
            on:click={() => void handleSaveCv()}
          >
            <AppIcon name="file-text" size={16}/>
            {generatingCv ? 'Preparing CV…' : 'Download CV'}
          </button>
          <button
            class="flex min-h-10 items-center gap-2.5 text-left hover:text-[var(--accent)] disabled:cursor-wait disabled:opacity-55"
            type="button"
            disabled={generatingCv}
            aria-expanded={tailorCvOpen}
            on:click={() => {
              tailorCvOpen = !tailorCvOpen;
              cvError = '';
            }}
          >
            <AppIcon name="file-text" size={16}/>
            Tailor to a role
          </button>

          {#if tailorCvOpen}
            <div class="col-span-full mt-2 space-y-2 lg:mt-3">
              <label class="block text-[12px] font-medium text-black/70" for="cv-job-description">Job description</label>
              <textarea
                id="cv-job-description"
                class="min-h-32 w-full resize-y rounded-md border border-black/16 bg-transparent p-3 text-[12px] leading-5 outline-none transition focus:border-[var(--accent)]"
                bind:value={jobDescription}
                maxlength="4000"
                placeholder="Paste the role description. It is used only to rank verified portfolio evidence and ATS vocabulary."
              ></textarea>
              <div class="flex items-center justify-between gap-3">
                <span class="text-[11px] text-black/50">{jobDescription.length}/4000</span>
                <button
                  class="min-h-9 border border-black/16 px-3 text-[12px] font-medium hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:cursor-wait disabled:opacity-55"
                  type="button"
                  disabled={generatingCv || !jobDescription.trim()}
                  on:click={() => void handleTailoredCv()}
                >
                  Prepare tailored CV
                </button>
              </div>
            </div>
          {/if}

          {#if generatingCv}
            <p class="col-span-full text-[12px] leading-5 text-black/58" role="status" aria-live="polite">Preparing a validated, ATS-friendly PDF from verified portfolio content.</p>
          {:else if cvGenerated}
            <p class="col-span-full text-[12px] leading-5 text-black/58" role="status">CV downloaded.</p>
          {/if}

          {#if cvError}<p class="cv-error col-span-full text-[12px] leading-5" role="alert">{cvError}</p>{/if}
        </div>
      </aside>

      <section class="min-w-0">
        <header class="border-b border-black/14 pb-8 sm:pb-9">
          <h1 class="w-full max-w-none text-balance text-[34px] font-semibold leading-[1.1] tracking-[-0.025em] sm:text-[38px] md:text-[48px] 2xl:text-[52px]">{page.subtitle}</h1>

          <div class="mt-6 w-full text-[15px] leading-7 text-black/62 sm:mt-7 sm:text-[16px] 2xl:text-[17px] 2xl:leading-8 [&_.project-markdown_p]:hyphens-auto [&_.project-markdown_p]:text-justify">
            <MarkdownArticle html={rendered.html} hasMermaid={rendered.hasMermaid}/>
          </div>
        </header>

        <section class="pt-8 sm:pt-9">
          <h2 class="text-[23px] font-semibold tracking-[-0.018em] sm:text-[25px]">Professional background</h2>
          <div class="mt-4 border-t border-black/14">
            {#each experiences as item, i}
              <TimelineEntry {item} first={i===0} last={i===experiences.length-1} wide/>
            {/each}
          </div>
        </section>

        <section class="mt-10 border-t border-black/14 pt-7 sm:mt-11 sm:pt-8">
          <h2 class="text-[23px] font-semibold tracking-[-0.018em] sm:text-[25px]">Technical focus</h2>
          <div class="mt-5 grid gap-x-10 gap-y-6 sm:mt-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 2xl:gap-x-12">
            {#each skillGroups as group}
              <article class="border-t border-black/14 pt-4">
                <h3 class="text-[16px] font-medium text-black/84">{group.title}</h3>
                <p class="mt-2 text-[13px] leading-6 text-black/60">{group.items.join(', ')}</p>
              </article>
            {/each}
          </div>
        </section>

        <section class="mt-10 border-t border-black/14 pt-7 sm:mt-11 sm:pt-8">
          <h2 class="text-[23px] font-semibold tracking-[-0.018em] sm:text-[25px]">Education</h2>
          <div class="mt-5 divide-y divide-black/14 border-y border-black/14">
            {#each education as item}
              <article class="grid gap-3 py-6 sm:gap-4 sm:py-7 md:grid-cols-[170px_minmax(0,1fr)] md:gap-8 2xl:grid-cols-[190px_minmax(0,1fr)] 2xl:gap-10">
                <p class="text-[13px] text-black/58">{item.year}</p>
                <div class="min-w-0">
                  <h3 class="text-[18px] font-semibold tracking-[-0.015em] text-black/86 sm:text-[19px]">{item.institution}</h3>
                  <p class="mt-1 text-[15px] text-black/62">{item.program}</p>
                  {#if item.description}
                    <div class="mt-4 text-[14px] leading-6 text-black/60 [&_.project-markdown_p]:hyphens-auto [&_.project-markdown_p]:text-justify">
                      <MarkdownArticle html={renderMarkdown(item.description).html}/>
                    </div>
                  {/if}
                </div>
              </article>
            {/each}
          </div>
        </section>

        {#if publications.length}
          <section class="mt-10 border-t border-black/14 pt-7 sm:mt-11 sm:pt-8">
            <h2 class="text-[23px] font-semibold tracking-[-0.018em] sm:text-[25px]">Academic work</h2>
            <div class="mt-5 divide-y divide-black/14 border-y border-black/14">
              {#each publications as item}
                <article class="grid gap-3 py-6 sm:gap-4 sm:py-7 md:grid-cols-[170px_minmax(0,1fr)] md:gap-8 2xl:grid-cols-[190px_minmax(0,1fr)] 2xl:gap-10">
                  <div>
                    <p class="text-[13px] text-black/58">{item.year}</p>
                    <p class="mt-1 text-[11px] uppercase tracking-[0.12em] text-black/58">{item.type.replace('-', ' ')}</p>
                  </div>
                  <div class="min-w-0">
                    <h3 class="text-[17px] font-semibold leading-7 tracking-[-0.012em] text-black/86 sm:text-[18px]">
                      <a class="hover:text-[var(--accent)]" href={item.url}>{item.title}</a>
                    </h3>
                    <p class="mt-1 text-[13px] text-black/58">{item.venue}</p>
                    <p class="mt-3 max-w-none hyphens-auto text-justify text-[14px] leading-6 text-black/60">{item.summary}</p>
                    {#if item.doi}
                      <a class="mt-3 inline-flex min-h-10 items-center text-[13px] text-[var(--accent)] underline decoration-current/35 underline-offset-4 hover:text-black" href={item.doi}>DOI</a>
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
