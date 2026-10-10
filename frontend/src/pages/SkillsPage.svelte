<script lang="ts">
  import { pageCopy, principles, skillGroups } from '../lib/structured-content';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <header class="border-b border-black/10 pb-9">
      <h1 class="text-[40px] font-semibold tracking-[-0.03em] md:text-[48px]">{pageCopy.skills.title}</h1>
      <p class="mt-4 max-w-none hyphens-auto text-justify text-[16px] leading-7 text-black/58">{pageCopy.skills.subtitle}</p>
    </header>

    <section class="py-10">
      <h2 class="text-[28px] font-semibold tracking-[-0.025em]">Technical focus</h2>
      <div class="mt-6 grid gap-x-12 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
        {#each skillGroups as group}
          <article class="border-t border-black/10 pt-4">
            <h3 class="text-[17px] font-semibold">{group.title}</h3>
            <p class="mt-2 hyphens-auto text-justify text-[14px] leading-6 text-black/54">{group.description}</p>
            <p class="mt-4 text-[13px] leading-6 text-black/65">{group.items.join(', ')}</p>
          </article>
        {/each}
      </div>
    </section>

    <section class="border-t border-black/10 py-10">
      <h2 class="text-[28px] font-semibold tracking-[-0.025em]">Engineering principles</h2>
      <div class="mt-6 grid gap-x-12 md:grid-cols-2">
        {#each principles as principle}
          <article class="border-t border-black/10 py-5">
            <h3 class="text-[17px] font-semibold">{principle.title}</h3>
            <p class="mt-2 hyphens-auto text-justify text-[14px] leading-6 text-black/55">{principle.description}</p>
          </article>
        {/each}
      </div>
    </section>
  </PageShell>
</main>
