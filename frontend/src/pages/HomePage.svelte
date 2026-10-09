<script lang="ts">
  import { pageCopy, profile } from '../lib/structured-content';
  import { getLatestProjects } from '../lib/project-content';
  import { navigate } from '../lib/router';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';

  const selectedProjects = getLatestProjects(3);
  const page = pageCopy.home;
</script>

<main>
  <PageShell>
    <section class="grid gap-10 py-14 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-20 lg:py-20">
      <div>
        <h1 class="text-[48px] font-semibold leading-[1] tracking-[-0.045em] md:text-[62px]">{profile.name}</h1>
        <p class="mt-4 max-w-[18ch] text-[30px] font-light leading-[1.1] tracking-[-0.025em] text-black/62 md:text-[42px]">{profile.headline}</p>
        <p class="mt-6 max-w-[58ch] text-[16px] leading-7 text-black/56">{profile.intro}</p>

        <div class="mt-8 flex flex-wrap items-center gap-5">
          <a class="btn btn-neutral h-12 min-h-0 rounded-none border-0 bg-[#344534] px-7 text-[14px] font-normal text-white hover:bg-[#263526]" href="/projects" on:click={(e)=>navigate(e,'/projects')}>{page.primaryAction} <span class="ml-2">→</span></a>
          <a class="text-[14px] text-black/65 underline decoration-black/25 underline-offset-4 hover:text-black" href={profile.email}>{page.secondaryAction}</a>
        </div>
      </div>

      <MediaImage className="aspect-[1.36] w-full" src={profile.image} alt={profile.name} eager/>
    </section>

    <section class="border-t border-black/10 py-10">
      <div class="flex items-baseline justify-between gap-6">
        <h2 class="text-[22px] font-semibold tracking-[-0.02em]">Selected work</h2>
        <a class="text-[12px] text-black/58 underline underline-offset-4 hover:text-black" href="/projects" on:click={(e)=>navigate(e,'/projects')}>All projects</a>
      </div>

      <div class="mt-7 divide-y divide-black/10 border-y border-black/10">
        {#each selectedProjects as project}
          {@const detailPath = '/projects/' + project.slug}
          <a class="grid gap-3 py-6 transition-colors hover:text-black md:grid-cols-[180px_1fr_auto] md:items-start md:gap-8" href={detailPath} on:click={(e)=>navigate(e,detailPath)}>
            <p class="text-[12px] text-black/40">{project.year}</p>
            <div>
              <h3 class="text-[18px] font-semibold tracking-[-0.015em]">{project.cardTitle}</h3>
              <p class="mt-2 max-w-[62ch] text-[14px] leading-6 text-black/54">{project.description}</p>
            </div>
            <span class="pt-1 text-[15px] text-black/35">→</span>
          </a>
        {/each}
      </div>
    </section>
  </PageShell>
</main>
