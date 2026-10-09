<script lang="ts">
  import { pageCopy, profile } from '../lib/structured-content';
  import { renderMarkdown } from '../lib/markdown';
  import { navigate } from '../lib/router';
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
    <section class="grid gap-10 lg:grid-cols-[.85fr_1.15fr] lg:items-start lg:gap-20">
      <div>
        <MediaImage className="aspect-[.84] w-full" src={profile.image} alt={profile.name}/>

        <div class="mt-6 border-t border-black/10 pt-5">
          <p class="text-[15px] font-medium text-black/82">{profile.name}</p>
          <p class="mt-1 text-[14px] text-black/52">{profile.role}</p>
        </div>

        <div class="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-black/62">
          <a class="underline decoration-black/20 underline-offset-4 hover:text-black" href={profile.github}>GitHub</a>
          <a class="underline decoration-black/20 underline-offset-4 hover:text-black" href={profile.linkedin}>LinkedIn</a>
          <a class="underline decoration-black/20 underline-offset-4 hover:text-black" href={profile.email}>Email</a>
        </div>
      </div>

      <div>
        <p class="text-[14px] font-medium text-black/48">About</p>
        <h1 class="mt-3 max-w-[18ch] text-[38px] font-semibold leading-[1.08] tracking-[-0.025em] md:text-[48px]">
          {page.subtitle}
        </h1>

        <div class="mt-7 max-w-[66ch] text-[16px] leading-7 text-black/62">
          <MarkdownArticle html={rendered.html} hasMermaid={rendered.hasMermaid}/>
        </div>

        <div class="mt-9 border-t border-black/10 pt-6">
          <p class="text-[13px] font-medium text-black/76">Go deeper</p>
          <div class="mt-3 flex flex-wrap gap-x-6 gap-y-3 text-[14px] text-black/62">
            <a class="underline decoration-black/20 underline-offset-4 hover:text-black" href="/experience" on:click={(e)=>navigate(e,'/experience')}>Experience</a>
            <a class="underline decoration-black/20 underline-offset-4 hover:text-black" href="/projects" on:click={(e)=>navigate(e,'/projects')}>Projects</a>
            <a class="underline decoration-black/20 underline-offset-4 hover:text-black" href="/skills" on:click={(e)=>navigate(e,'/skills')}>Skills & education</a>
          </div>
        </div>

        <div class="mt-9 border-t border-black/10 pt-6">
          <button
            class="text-[14px] font-medium underline decoration-black/20 underline-offset-4 hover:text-black disabled:cursor-wait disabled:opacity-45"
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
        </div>
      </div>
    </section>
  </PageShell>
</main>
