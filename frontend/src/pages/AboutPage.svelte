<script lang="ts">
  import AppIcon from '../lib/ui/AppIcon.svelte';
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
  <PageShell className="py-14 lg:py-16">
    <div class="grid gap-12 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[250px_minmax(0,1fr)] xl:gap-14">
      <aside class="self-start lg:border-r lg:border-black/10 lg:pr-8">
        <MediaImage className="aspect-[.82] w-full" src={profile.image} alt={profile.name}/>

        <h2 class="mt-5 text-[24px] font-semibold leading-tight tracking-[-0.02em]">{profile.name}</h2>
        <p class="mt-1 text-[14px] text-black/55">{profile.role}</p>

        <div class="mt-5 space-y-2.5 text-[13px] text-black/60">
          <p class="flex items-center gap-2.5"><AppIcon name="map-pin" size={15}/>{profile.location}</p>
          <p class="flex items-center gap-2.5"><AppIcon name="globe" size={15}/>{profile.languages}</p>
        </div>

        <div class="my-5 h-px bg-black/10"></div>

        <div class="space-y-2.5 text-[13px]">
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
        <p class="text-[14px] font-medium text-black/48">About</p>
        <h1 class="mt-3 max-w-[24ch] text-pretty text-[38px] font-semibold leading-[1.08] tracking-[-0.025em] md:text-[48px]">{page.subtitle}</h1>

        <div class="mt-7 max-w-[84ch] text-[16px] leading-7 text-black/62">
          <MarkdownArticle html={rendered.html} hasMermaid={rendered.hasMermaid}/>
        </div>

        <section class="mt-10 border-t border-black/10 pt-7">
          <h2 class="text-[22px] font-semibold tracking-[-0.015em]">Professional background</h2>
          <div class="mt-5 divide-y divide-black/10 border-y border-black/10">
            {#each experiences as item}
              <article class="grid gap-3 py-5 md:grid-cols-[130px_220px_minmax(0,1fr)] md:gap-6 xl:grid-cols-[145px_240px_minmax(0,1fr)] xl:gap-8">
                <p class="text-[13px] text-black/42">{item.year}</p>
                <div>
                  <h3 class="text-[16px] font-medium text-black/82">{item.role}</h3>
                  <p class="mt-0.5 text-[13px] text-black/50">{item.company}</p>
                </div>
                <p class="max-w-[72ch] text-pretty text-[14px] leading-6 text-black/56">{item.summary}</p>
              </article>
            {/each}
          </div>
        </section>

        <section class="mt-10 border-t border-black/10 pt-7">
          <h2 class="text-[22px] font-semibold tracking-[-0.015em]">Technical focus</h2>
          <div class="mt-5 grid gap-x-10 gap-y-7 md:grid-cols-2 xl:grid-cols-3">
            {#each skillGroups as group}
              <article>
                <h3 class="text-[15px] font-medium text-black/80">{group.title}</h3>
                <p class="mt-2 text-pretty text-[13px] leading-6 text-black/52">{group.items.join(', ')}</p>
              </article>
            {/each}
          </div>
        </section>

        <section class="mt-10 border-t border-black/10 pt-7">
          <h2 class="text-[22px] font-semibold tracking-[-0.015em]">Education</h2>
          <div class="mt-5 divide-y divide-black/10 border-y border-black/10">
            {#each education as item}
              <article class="grid gap-3 py-5 md:grid-cols-[130px_250px_minmax(0,1fr)] md:gap-6 xl:grid-cols-[145px_280px_minmax(0,1fr)] xl:gap-8">
                <p class="text-[13px] text-black/42">{item.year}</p>
                <div>
                  <h3 class="text-[16px] font-medium text-black/82">{item.institution}</h3>
                  <p class="mt-1 text-[14px] text-black/58">{item.program}</p>
                </div>
                {#if item.description}
                  <div class="max-w-[72ch] text-[13px] leading-6 text-black/52">
                    <MarkdownArticle html={renderMarkdown(item.description).html}/>
                  </div>
                {/if}
              </article>
            {/each}
          </div>
        </section>

        {#if publications.length}
          <section class="mt-10 border-t border-black/10 pt-7">
            <h2 class="text-[22px] font-semibold tracking-[-0.015em]">Academic work</h2>
            <div class="mt-5 divide-y divide-black/10 border-y border-black/10">
              {#each publications as item}
                <article class="grid gap-3 py-5 md:grid-cols-[130px_minmax(0,1fr)_220px] md:gap-6 xl:grid-cols-[145px_minmax(0,1fr)_260px] xl:gap-8">
                  <p class="text-[13px] text-black/42">{item.year}</p>
                  <h3 class="text-pretty text-[15px] font-medium leading-6 text-black/82">
                    <a class="hover:opacity-60" href={item.url}>{item.title}</a>
                  </h3>
                  <p class="text-[13px] leading-6 text-black/50">{item.venue}</p>
                </article>
              {/each}
            </div>
          </section>
        {/if}
      </section>
    </div>
  </PageShell>
</main>
