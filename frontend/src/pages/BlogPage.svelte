<script lang="ts">
  import { articles, projects } from '../lib/data';
  import { navigate } from '../lib/router';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <div class="border-b border-black/10 pb-10">
      <PageIntro eyebrow="Engineering journal" title="Notes on software, systems, and things" subtitle="I learn while building them." description="Practical notes, technical deep dives, and lessons from building and operating real systems across backend, AI, cloud infrastructure, and connected devices." compact/>
    </div>

    <section class="grid gap-10 border-b border-black/10 py-10 lg:grid-cols-[1fr_1fr]">
      <div class="self-center">
        <p class="text-[11px] font-semibold uppercase tracking-[.2em] text-black/50">Featured</p>
        <p class="mt-4 text-[13px] text-black/45">Engineering · 12 min read · Sep 2026</p>
        <h2 class="mt-6 text-[30px] font-semibold tracking-[-0.03em]">Designing Reliable Event-Driven Systems</h2>
        <p class="mt-4 max-w-xl text-[15px] leading-7 text-black/56">Patterns, trade-offs, and practical lessons from building event-driven systems at scale, including idempotency, ordering, failure handling, and operational considerations.</p>
        <a class="btn btn-neutral mt-7 rounded-none border-0 bg-[#344534] px-7 font-normal" href="/blog/event-driven-systems" on:click={(e)=>navigate(e,'/blog/event-driven-systems')}>Read article →</a>
      </div>
      <MediaImage className="aspect-[1.7] w-full" src={projects[0].image} alt="Event-driven systems" eager/>
    </section>

    <section class="pt-8">
      <div class="flex justify-between text-[12px]"><strong class="uppercase tracking-[.2em]">All articles</strong><span class="text-black/45">{articles.length} articles</span></div>
      {#each articles as a}
        <a href="/blog/event-driven-systems" on:click={(e)=>navigate(e,'/blog/event-driven-systems')} class="grid gap-5 border-b border-black/10 py-7 md:grid-cols-[150px_1fr_30px]">
          <span class="pt-1 text-[13px] text-black/42">{a[0]}</span>
          <div><p class="text-[12px] text-black/50">{a[1]} · {a[2]}</p><h2 class="mt-2 text-[22px] font-semibold tracking-[-0.02em]">{a[3]}</h2><p class="mt-2 max-w-3xl text-[14px] leading-6 text-black/55">{a[4]}</p></div>
          <span class="self-center text-lg">→</span>
        </a>
      {/each}
    </section>
  </PageShell>
</main>
