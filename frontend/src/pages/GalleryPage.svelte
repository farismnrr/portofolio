<script lang="ts">
  import { gallery } from '../lib/data';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <PageIntro eyebrow="Photography" title="Gallery" subtitle="Places, people, ideas, and moments along the way." description="A collection of photographs from my work, travels, and everyday life. Cities, conferences, build sessions, and the small moments in between." compact/>

    <div class="mt-10 grid auto-rows-[130px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
      {#each gallery as g,i}
        <figure class={
          i===0 ? "sm:col-span-2 lg:col-span-6 lg:row-span-3" :
          i===2 ? "lg:col-span-4 lg:row-span-4" :
          i===3 ? "lg:col-span-4 lg:row-span-3" :
          i===7 ? "sm:col-span-2 lg:col-span-7 lg:row-span-3" :
          i===11 ? "sm:col-span-2 lg:col-span-5 lg:row-span-3" :
          "lg:col-span-3 lg:row-span-2"
        }>
          <img class="h-[calc(100%-22px)] min-h-[100px] w-full object-cover" src={g[0]} alt={g[1]}/>
          <figcaption class="mt-2 text-[11px] text-black/45">{g[1]}</figcaption>
        </figure>
      {/each}
    </div>
  </PageShell>
</main>
