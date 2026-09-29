<script lang="ts">
  import { education, pageCopy, principles, skillGroups } from '../lib/structured-content';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import TechChips from '../lib/ui/TechChips.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <section class="grid gap-12 border-b border-black/10 pb-12 lg:grid-cols-[.72fr_1.28fr]">
      <PageIntro eyebrow={pageCopy.skills.eyebrow} title={pageCopy.skills.title} subtitle={pageCopy.skills.subtitle} description={pageCopy.skills.description} compact/>
      <div>
        {#each education as item, i}
          <article class="grid gap-5 border-b border-black/10 py-8 md:grid-cols-[150px_1fr]">
            <p class="text-[14px] text-black/45">{item.year}</p>
            <div class="relative">
              {#if i===0}<span class="absolute -left-8 top-2 h-2.5 w-2.5 rounded-full bg-[#38503a]"></span>{/if}
              <h3 class="text-[22px] font-semibold">{item.institution}</h3>
              <p class="mt-1 text-[16px] text-black/60">{item.program}</p>
              <p class="mt-4 max-w-3xl text-[14px] leading-6 text-black/55">{item.description}</p>
            </div>
          </article>
        {/each}
      </div>
    </section>

    <section class="py-12">
      <PageIntro eyebrow={pageCopy["technical-skills"].eyebrow} title={pageCopy["technical-skills"].title} subtitle={pageCopy["technical-skills"].subtitle} description={pageCopy["technical-skills"].description} compact/>
      <div class="mt-8 grid gap-x-12 md:grid-cols-2">
        {#each skillGroups as group}
          <div class="border-b border-black/10 py-7">
            <h3 class="text-[13px] font-semibold uppercase tracking-[0.18em]">{group.title}</h3>
            <p class="mt-2 text-[14px] text-black/50">{group.description}</p>
            <div class="mt-5"><TechChips items={group.items}/></div>
          </div>
        {/each}
      </div>
    </section>

    <section class="border-t border-black/10 py-12">
      <PageIntro eyebrow={pageCopy.principles.eyebrow} title={pageCopy.principles.title} subtitle={pageCopy.principles.subtitle} description={pageCopy.principles.description} compact/>
      <div class="mt-8 grid gap-x-12 md:grid-cols-2">
        {#each principles as principle}
          <article class="grid grid-cols-[48px_1fr] gap-5 border-b border-black/10 py-7">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-[#eceee8] text-[12px] text-black/60">{principle.index}</span>
            <div><h3 class="text-[17px] font-semibold">{principle.title}</h3><p class="mt-2 text-[14px] leading-6 text-black/55">{principle.description}</p></div>
          </article>
        {/each}
      </div>
    </section>
  </PageShell>
</main>
