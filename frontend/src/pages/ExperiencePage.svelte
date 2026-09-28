<script lang="ts">
  import { experiences, education } from '../lib/data';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import TimelineEntry from '../lib/ui/TimelineEntry.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <div class="grid gap-10 border-b border-black/10 pb-12 lg:grid-cols-[1.35fr_.65fr]">
      <PageIntro eyebrow="Work experience" title="Professional experience" subtitle="A journey of building, learning, and solving real-world problems."/>
      <p class="max-w-md self-end pb-2 text-[16px] leading-7 text-black/55">I’ve worked across different stages of the stack, from backend systems to cloud infrastructure, and contributed to products used by real people. Each experience has shaped how I approach complex problems and build scalable, maintainable solutions.</p>
    </div>

    <section>
      {#each experiences as item, i}<TimelineEntry {item} first={i===0} last={i===experiences.length-1}/>{/each}
    </section>

    <section class="mt-12 border-t border-black/10 pt-10">
      <div class="grid gap-10 lg:grid-cols-[1fr_.65fr]">
        <PageIntro eyebrow="Education" title="Education" subtitle="A strong foundation for continuous growth." compact/>
        <p class="max-w-md self-end text-[15px] leading-7 text-black/55">My academic journey gave me a solid foundation in computer science, problem solving, and systems thinking.</p>
      </div>
      <div class="mt-8">
        {#each education as item}
          <article class="grid gap-6 border-b border-black/10 py-8 md:grid-cols-[180px_1fr]">
            <p class="text-[14px] text-black/45">{item[0]}</p>
            <div><h3 class="text-[21px] font-semibold">{item[1]}</h3><p class="mt-1 text-[16px] text-black/62">{item[2]}</p><p class="mt-3 max-w-3xl text-[14px] leading-6 text-black/55">{item[3]}</p></div>
          </article>
        {/each}
      </div>
    </section>
  </PageShell>
</main>
