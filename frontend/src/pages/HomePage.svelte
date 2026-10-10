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
    <section class="grid gap-9 py-10 sm:gap-10 sm:py-12 lg:min-h-[calc(100vh-7rem)] lg:grid-cols-[1.12fr_.88fr] lg:items-center lg:gap-14 lg:py-20 xl:gap-18">
      <div class="max-w-[840px]">
        <h1 class="text-[42px] font-semibold leading-[1.03] tracking-[-0.035em] sm:text-[48px] md:text-[62px]">{profile.name}</h1>
        <p class="mt-4 max-w-[28ch] text-balance text-[23px] font-medium leading-[1.22] tracking-[-0.018em] text-black/74 sm:mt-5 sm:text-[26px] md:text-[34px]">{profile.headline}</p>
        <p class="mt-5 hyphens-auto text-justify text-[15px] font-normal leading-7 text-black/58 sm:mt-6 sm:text-[16px]">{profile.intro}</p>

        <div class="mt-7 flex flex-wrap items-center gap-4 sm:mt-8 sm:gap-5">
          <a class="btn btn-neutral min-h-12 rounded-none border-0 bg-[#344534] px-6 text-[14px] font-medium text-white hover:bg-[#263526] sm:px-7" href="/about" on:click={(e)=>navigate(e,'/about')}>{page.primaryAction} <span class="ml-2">→</span></a>
          <a class="inline-flex min-h-11 items-center text-[14px] font-normal text-black/65 underline decoration-black/25 underline-offset-4 hover:text-black" href={profile.email}>{page.secondaryAction}</a>
        </div>
      </div>

      <MediaImage className="aspect-[1.36] w-full max-w-[620px] justify-self-center lg:justify-self-end" src={profile.image} alt={profile.name} eager/>
    </section>
  </PageShell>
</main>
