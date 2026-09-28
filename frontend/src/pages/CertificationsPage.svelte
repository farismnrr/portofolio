<script lang="ts">
  import { certGroups } from '../lib/data';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <div class="border-b border-black/10 pb-10">
      <PageIntro eyebrow="Resume · Growth · Recognition" title="Certifications & Achievements" subtitle="Credentials that validate my skills and continuous learning journey in software engineering, cloud, AI, and related technologies." compact/>
    </div>

    {#each certGroups as group}
      <section class="border-b border-black/10 py-9">
        <div class="grid gap-4 md:grid-cols-[1fr_1.35fr_auto]">
          <h2 class="text-[28px] font-semibold tracking-[-0.03em]">{group[0]}</h2>
          <p class="max-w-xl text-[14px] leading-6 text-black/52">Certifications focused on practical skills and professional development across this area.</p>
          <span class="text-[13px] text-black/45">{group[1].length} credentials</span>
        </div>
        <div class="mt-7 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {#each group[1] as cert}
            <article>
              <div class="flex aspect-[1.78] items-center border border-black/12 bg-white/55 p-7 shadow-[0_1px_8px_rgba(0,0,0,.035)]">
                <div><p class="text-[16px] font-semibold text-black/65">{cert[0]}</p><h3 class="mt-5 text-[24px] font-semibold leading-tight tracking-[-0.025em]">{cert[1]}</h3><p class="mt-4 text-[10px] uppercase tracking-[.16em] text-black/35">Professional Certificate</p></div>
              </div>
              <h3 class="mt-4 text-[16px] font-semibold">{cert[1]}</h3>
              <p class="mt-1 text-[13px] text-black/52">{cert[0]}</p>
              <p class="mt-1 text-[12px] text-black/42">{cert[2]} · Credential ID: DEMO-{cert[2]}-84217</p>
              <a class="mt-3 inline-block text-[12px] text-black/68 underline underline-offset-4" href="/">View Credential →</a>
            </article>
          {/each}
        </div>
      </section>
    {/each}
  </PageShell>
</main>
