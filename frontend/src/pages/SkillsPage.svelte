<script lang="ts">
  import { pageCopy, principles, skillGroups } from '../lib/structured-content';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-10 sm:py-12 lg:py-16">
    <header class="border-b border-black/10 pb-8 sm:pb-9">
      <h1 class="text-[36px] font-semibold tracking-[-0.03em] sm:text-[40px] md:text-[48px]">{pageCopy.skills.title}</h1>
      <p class="mt-4 max-w-none hyphens-auto text-justify text-[15px] leading-7 text-black/58 sm:text-[16px]">{pageCopy.skills.subtitle}</p>
    </header>

    <section class="py-8 sm:py-10">
      <h2 class="text-[24px] font-semibold tracking-[-0.025em] sm:text-[28px]">Technical focus</h2>
      <div class="mt-5 grid gap-x-10 gap-y-7 sm:mt-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-x-12 xl:gap-y-8">
        {#each skillGroups as group}
          <article class="border-t border-black/10 pt-4">
            <h3 class="text-[16px] font-semibold sm:text-[17px]">{group.title}</h3>
            <p class="mt-2 hyphens-auto text-justify text-[14px] leading-6 text-black/54">{group.description}</p>
            <p class="mt-3 text-[13px] leading-6 text-black/65 sm:mt-4">{group.items.join(', ')}</p>
          </article>
        {/each}
      </div>
    </section>

    <section class="border-t border-black/10 py-8 sm:py-10">
      <h2 class="text-[24px] font-semibold tracking-[-0.025em] sm:text-[28px]">Engineering principles</h2>
      <div class="mt-5 grid gap-x-10 sm:mt-6 sm:grid-cols-2 xl:gap-x-12">
        {#each principles as principle}
          <article class="border-t border-black/10 py-5">
            <h3 class="text-[16px] font-semibold sm:text-[17px]">{principle.title}</h3>
            <p class="mt-2 hyphens-auto text-justify text-[14px] leading-6 text-black/55">{principle.description}</p>
          </article>
        {/each}
      </div>
    </section>
  </PageShell>
</main>
