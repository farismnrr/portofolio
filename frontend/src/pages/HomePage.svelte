<script lang="ts">
  import { pageCopy, profile } from '../lib/structured-content';
  import { navigate } from '../lib/router';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';

  // Project discovery stays on the dedicated Projects page; getLatestProjects is intentionally not rendered here.
  const page = pageCopy.home;
</script>

<main>
  <PageShell>
    <section class="grid min-h-[calc(100vh-7rem)] gap-10 py-14 lg:grid-cols-[1.12fr_.88fr] lg:items-center lg:gap-14 lg:py-20 xl:gap-18">
      <div class="max-w-[840px]">
        <h1 class="text-[48px] font-semibold leading-[1.02] tracking-[-0.035em] md:text-[62px]">{profile.name}</h1>
        <p class="mt-5 max-w-[28ch] text-balance text-[26px] font-medium leading-[1.18] tracking-[-0.018em] text-black/74 md:text-[34px]">{profile.headline}</p>
        <p class="mt-6 max-w-[70ch] text-[16px] font-normal leading-7 text-black/58 lg:[hyphens:auto] lg:[text-align:justify]">{profile.intro}</p>

        <div class="mt-8 flex flex-wrap items-center gap-5">
          <a class="btn btn-neutral h-12 min-h-0 rounded-none border-0 bg-[#344534] px-7 text-[14px] font-medium text-white hover:bg-[#263526]" href="/about" on:click={(e)=>navigate(e,'/about')}>{page.primaryAction} <span class="ml-2">→</span></a>
          <a class="text-[14px] font-normal text-black/65 underline decoration-black/25 underline-offset-4 hover:text-black" href={profile.email}>{page.secondaryAction}</a>
        </div>
      </div>

      <MediaImage className="aspect-[1.36] w-full max-w-[620px] justify-self-end" src={profile.image} alt={profile.name} eager/>
    </section>
  </PageShell>
</main>
