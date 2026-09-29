<script lang="ts">
  import { education, skillGroups, principles } from '../lib/data';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import TechChips from '../lib/ui/TechChips.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
  import { navigate } from '../lib/router';
  import MediaImage from '../lib/ui/MediaImage.svelte';
  const skills = skillGroups as [string,string,string[]][];
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <section class="grid gap-12 border-b border-black/10 pb-12 lg:grid-cols-[.72fr_1.28fr]">
      <PageIntro eyebrow="Education" title="Academic Foundation" subtitle="A strong foundation in computer science and electronics, which shaped my problem-solving mindset and interest in building real-world systems." compact/>
      <div>
        {#each education as item, i}
          <article class="grid gap-5 border-b border-black/10 py-8 md:grid-cols-[150px_1fr]">
            <p class="text-[14px] text-black/45">{item[0]}</p>
            <div class="relative">
              {#if i===0}<span class="absolute -left-8 top-2 h-2.5 w-2.5 rounded-full bg-[#38503a]"></span>{/if}
              <h3 class="text-[22px] font-semibold">{item[1]}</h3><p class="mt-1 text-[16px] text-black/60">{item[2]}</p><p class="mt-4 max-w-3xl text-[14px] leading-6 text-black/55">{item[3]}</p>
            </div>
          </article>
        {/each}
      </div>
    </section>

    <section class="py-12">
      <PageIntro eyebrow="Technical skills" title="Tools and Technologies" description="A curated set of technologies I work with to design, build, and operate reliable systems across backend, AI, and connected devices." compact/>
      <div class="mt-8 grid gap-x-12 md:grid-cols-2">
        {#each skills as group}
          <div class="border-b border-black/10 py-7">
            <h3 class="text-[13px] font-semibold uppercase tracking-[0.18em]">{group[0]}</h3>
            <p class="mt-2 text-[14px] text-black/50">{group[1]}</p>
            <div class="mt-5"><TechChips items={group[2]}/></div>
          </div>
        {/each}
      </div>
    </section>

    <section class="border-t border-black/10 py-12">
      <PageIntro eyebrow="Engineering principles" title="Principles I Work By" description="These principles guide how I approach problems, make trade-offs, and build systems that create lasting value." compact/>
      <div class="mt-8 grid gap-x-12 md:grid-cols-2">
        {#each principles as p}
          <article class="grid grid-cols-[48px_1fr] gap-5 border-b border-black/10 py-7">
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-[#eceee8] text-[12px] text-black/60">{p[0]}</span>
            <div><h3 class="text-[17px] font-semibold">{p[1]}</h3><p class="mt-2 text-[14px] leading-6 text-black/55">{p[2]}</p></div>
          </article>
        {/each}
      </div>
    </section>

    <section class="grid gap-10 border-t border-black/10 py-12 md:grid-cols-2">
      <div>
        <p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/48">Let’s connect</p>
        <h2 class="mt-4 text-[38px] font-semibold tracking-[-0.04em]">Interested in working together?</h2>
        <p class="mt-4 max-w-xl text-[15px] leading-7 text-black/55">I’m always open to discussing new opportunities, interesting projects, or just having a conversation about technology and ideas.</p>
        <div class="mt-6 flex gap-3"><a class="btn btn-neutral rounded-none border-0 bg-[#344534] px-6 font-normal" href="/projects" on:click={(e)=>navigate(e,'/projects')}>View Projects →</a><a class="btn btn-outline rounded-none border-black/20 px-6 font-normal" href="mailto:hello@example.com">Contact Me</a></div>
      </div>
      <MediaImage className="aspect-[2.05] w-full" src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85" alt="Workspace"/>
    </section>
  </PageShell>
</main>
