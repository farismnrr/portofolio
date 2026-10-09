<script lang="ts">
  import { education, experiences, pageCopy, profile, publications, skillGroups } from '../lib/structured-content';
  import { renderMarkdown } from '../lib/markdown';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
  import MarkdownArticle from '../lib/ui/MarkdownArticle.svelte';

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
  <PageShell className="py-14 lg:py-18">
    <section class="grid gap-10 lg:grid-cols-[.78fr_1.22fr] lg:items-start lg:gap-20">
      <aside>
        <MediaImage className="aspect-[.84] w-full" src={profile.image} alt={profile.name}/>

        <div class="mt-6 border-t border-black/10 pt-5">
          <p class="text-[15px] font-medium text-black/82">{profile.name}</p>
          <p class="mt-1 text-[14px] text-black/52">{profile.role}</p>
        </div>

        <dl class="mt-6 space-y-3 text-[13px] leading-5">
          <div>
            <dt class="text-black/40">Based in</dt>
            <dd class="mt-0.5 text-black/68">{profile.location}</dd>
          </div>
          <div>
            <dt class="text-black/40">Languages</dt>
            <dd class="mt-0.5 text-black/68">{profile.languages}</dd>
          </div>
        </dl>

        <div class="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-black/62">
          <a class="underline decoration-black/20 underline-offset-4 hover:text-black" href={profile.github}>GitHub</a>
          <a class="underline decoration-black/20 underline-offset-4 hover:text-black" href={profile.linkedin}>LinkedIn</a>
          <a class="underline decoration-black/20 underline-offset-4 hover:text-black" href={profile.email}>Email</a>
        </div>
      </aside>

      <div>
        <p class="text-[14px] font-medium text-black/48">About</p>
        <h1 class="mt-3 max-w-[18ch] text-[38px] font-semibold leading-[1.08] tracking-[-0.025em] md:text-[48px]">
          {page.subtitle}
        </h1>

        <div class="mt-7 max-w-[66ch] text-[16px] leading-7 text-black/62">
          <MarkdownArticle html={rendered.html} hasMermaid={rendered.hasMermaid}/>
        </div>

        <section class="mt-12 border-t border-black/10 pt-8">
          <h2 class="text-[24px] font-semibold tracking-[-0.015em]">Professional background</h2>
          <div class="mt-6 divide-y divide-black/10 border-y border-black/10">
            {#each experiences as item}
              <article class="grid gap-3 py-5 sm:grid-cols-[145px_1fr] sm:gap-7">
                <p class="text-[13px] text-black/42">{item.year}</p>
                <div>
                  <h3 class="text-[16px] font-medium text-black/82">{item.role}</h3>
                  <p class="mt-0.5 text-[13px] text-black/50">{item.company}</p>
                  <p class="mt-2 max-w-[62ch] text-[14px] leading-6 text-black/56">{item.summary}</p>
                </div>
              </article>
            {/each}
          </div>
        </section>

        <section class="mt-12 border-t border-black/10 pt-8">
          <h2 class="text-[24px] font-semibold tracking-[-0.015em]">Technical focus</h2>
          <div class="mt-6 grid gap-6 sm:grid-cols-2">
            {#each skillGroups as group}
              <article>
                <h3 class="text-[15px] font-medium text-black/80">{group.title}</h3>
                <p class="mt-2 text-[13px] leading-6 text-black/52">{group.items.join(', ')}</p>
              </article>
            {/each}
          </div>
        </section>

        <section class="mt-12 border-t border-black/10 pt-8">
          <h2 class="text-[24px] font-semibold tracking-[-0.015em]">Education</h2>
          <div class="mt-6 divide-y divide-black/10 border-y border-black/10">
            {#each education as item}
              <article class="grid gap-3 py-5 sm:grid-cols-[145px_1fr] sm:gap-7">
                <p class="text-[13px] text-black/42">{item.year}</p>
                <div>
                  <h3 class="text-[16px] font-medium text-black/82">{item.institution}</h3>
                  <p class="mt-1 text-[14px] text-black/58">{item.program}</p>
                </div>
              </article>
            {/each}
          </div>
        </section>

        {#if publications.length}
          <section class="mt-12 border-t border-black/10 pt-8">
            <h2 class="text-[24px] font-semibold tracking-[-0.015em]">Academic work</h2>
            <div class="mt-6 divide-y divide-black/10 border-y border-black/10">
              {#each publications as item}
                <article class="grid gap-3 py-5 sm:grid-cols-[145px_1fr] sm:gap-7">
                  <p class="text-[13px] text-black/42">{item.year}</p>
                  <div>
                    <h3 class="text-[15px] font-medium leading-6 text-black/82">
                      <a class="hover:opacity-60" href={item.url}>{item.title}</a>
                    </h3>
                    <p class="mt-1 text-[13px] text-black/50">{item.venue}</p>
                  </div>
                </article>
              {/each}
            </div>
          </section>
        {/if}

        <section class="mt-12 border-t border-black/10 pt-8">
          <h2 class="text-[24px] font-semibold tracking-[-0.015em]">CV</h2>
          <p class="mt-2 max-w-[56ch] text-[14px] leading-6 text-black/54">Generate a CV from the verified experience, education, and portfolio evidence stored in this site.</p>
          <button
            class="mt-4 text-[14px] font-medium underline decoration-black/20 underline-offset-4 hover:text-black disabled:cursor-wait disabled:opacity-45"
            type="button"
            disabled={generatingCv}
            on:click={handleSaveCv}
          >
            {generatingCv ? 'Generating CV…' : 'Generate CV'}
          </button>

          {#if generatingCv}
            <p class="mt-3 max-w-[52ch] text-[12px] leading-5 text-black/48" role="status" aria-live="polite">
              Selecting verified portfolio evidence and preparing the PDF.
            </p>
          {:else if cvGenerated}
            <p class="mt-3 text-[12px] leading-5 text-black/48" role="status">CV generated and downloaded.</p>
          {/if}

          {#if cvError}<p class="cv-error mt-3 text-[12px] leading-5">{cvError}</p>{/if}
        </section>
      </div>
    </section>
  </PageShell>
</main>
