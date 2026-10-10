<script lang="ts">
  import { experiences, pageCopy } from '../lib/structured-content';
  import TimelineEntry from '../lib/ui/TimelineEntry.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';

  const page = pageCopy.experience;
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <header class="border-b border-black/10 pb-9">
      <h1 class="text-[40px] font-semibold tracking-[-0.03em] md:text-[48px]">{page.title}</h1>
      <p class="mt-4 max-w-none hyphens-auto text-justify text-[16px] leading-7 text-black/58">{page.subtitle}</p>
    </header>

    <section>
      {#each experiences as item, i}
        <TimelineEntry {item} first={i===0} last={i===experiences.length-1} wide/>
      {/each}
    </section>
  </PageShell>
</main>
