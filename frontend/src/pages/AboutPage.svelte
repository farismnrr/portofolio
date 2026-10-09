<script lang="ts">
  import { education, getLatestExperiences, pageCopy, profile, skillGroups } from '../lib/structured-content';
  import { getLatestProjects } from '../lib/project-content';
  import { renderMarkdown } from '../lib/markdown';
  import { navigate } from '../lib/router';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
  import MarkdownArticle from '../lib/ui/MarkdownArticle.svelte';

  const page = pageCopy.about;
  const rendered = renderMarkdown(page.body);
  const currentExperience = getLatestExperiences(1)[0];
  const selectedProjects = getLatestProjects(3);
  const educationEntry = education[0];
  const skillFocus = skillGroups.slice(0, 3).map((group) => group.title).join(', ');

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

        <div class="mt-10 border-t border-black/10">
          {#if currentExperience}
            <section class="grid gap-3 border-b border-black/10 py-6 sm:grid-cols-[120px_1fr] sm:gap-7">
              <h2 class="text-[14px] font-medium text-black/78">Experience</h2>
              <div>
                <p class="text-[15px] font-medium text-black/84">{currentExperience.role} at {currentExperience.company}</p>
                <p class="mt-2 max-w-[62ch] text-[14px] leading-6 text-black/56">{currentExperience.summary}</p>
                <a class="mt-3 inline-block text-[13px] underline decoration-black/20 underline-offset-4 hover:text-black" href="/experience" on:click={(e)=>navigate(e,'/experience')}>View experience →</a>
              </div>
            </section>
          {/if}

          <section class="grid gap-3 border-b border-black/10 py-6 sm:grid-cols-[120px_1fr] sm:gap-7">
            <h2 class="text-[14px] font-medium text-black/78">Selected work</h2>
            <div>
              <p class="text-[15px] leading-6 text-black/72">{selectedProjects.map((project) => project.cardTitle).join(', ')}</p>
              <p class="mt-2 max-w-[62ch] text-[14px] leading-6 text-black/56">Backend, cloud, IoT, and AI-related systems represented through project case studies.</p>
              <a class="mt-3 inline-block text-[13px] underline decoration-black/20 underline-offset-4 hover:text-black" href="/projects" on:click={(e)=>navigate(e,'/projects')}>View projects →</a>
            </div>
          </section>

          <section class="grid gap-3 border-b border-black/10 py-6 sm:grid-cols-[120px_1fr] sm:gap-7">
            <h2 class="text-[14px] font-medium text-black/78">Background</h2>
            <div>
              {#if skillFocus}<p class="text-[15px] leading-6 text-black/72">{skillFocus}</p>{/if}
              {#if educationEntry}<p class="mt-2 max-w-[62ch] text-[14px] leading-6 text-black/56">{educationEntry.program}, {educationEntry.institution}</p>{/if}
              <a class="mt-3 inline-block text-[13px] underline decoration-black/20 underline-offset-4 hover:text-black" href="/skills" on:click={(e)=>navigate(e,'/skills')}>View skills & education →</a>
            </div>
          </section>
        </div>

        <div class="mt-8">
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
