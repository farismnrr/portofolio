<script lang="ts">
  import { ArrowLeft } from 'lucide-svelte';
  import { navigate } from '../lib/router';
  import TechChips from '../lib/ui/TechChips.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
  import { projects } from '../lib/data';
  const project = projects[0];
</script>

<main>
  <PageShell className="py-12">
    <a class="flex items-center gap-2 text-[12px] text-black/55 hover:text-black" href="/projects" on:click={(e)=>navigate(e,'/projects')}><ArrowLeft size={14}/>View all projects</a>

    <section class="mt-8 grid gap-12 border-b border-black/10 pb-12 lg:grid-cols-[.72fr_1.28fr]">
      <div>
        <p class="text-[11px] uppercase tracking-[.2em] text-black/45">2026</p>
        <h1 class="mt-5 text-[52px] font-semibold leading-[1] tracking-[-0.045em]">Sensio Notes</h1>
        <p class="mt-3 text-[28px] font-light text-black/58">Meeting Intelligence Platform</p>
        <p class="mt-4 text-[13px] text-black/50">Software Engineer · AI / Backend / Infrastructure</p>
        <p class="mt-6 max-w-xl text-[15px] leading-7 text-black/57">An AI-powered meeting intelligence platform that transcribes, understands, and organizes conversations into actionable insights, helping teams move from discussion to decisions.</p>
        <div class="mt-7 flex gap-3"><a class="btn btn-neutral rounded-none border-0 bg-[#344534] px-7 font-normal" href="https://example.com">Visit Product ↗</a><a class="btn btn-outline rounded-none border-black/20 px-7 font-normal" href="https://github.com">View Code</a></div>
      </div>
      <img class="aspect-[1.72] w-full object-cover" src={project.image} alt="Meeting intelligence platform"/>
    </section>

    <section class="grid gap-10 border-b border-black/10 py-10 lg:grid-cols-[.72fr_1.28fr]">
      <div><p class="text-[11px] uppercase tracking-[.2em] text-black/45">01 · Project overview</p><h2 class="mt-5 text-[38px] font-light leading-[1.1] tracking-[-0.035em]">Turn conversations<br/>into progress.</h2><p class="mt-5 max-w-lg text-[15px] leading-7 text-black/56">The platform transcribes conversations, extracts key insights, and generates summaries, action items, and searchable knowledge from meetings.</p></div>
      <img class="aspect-[1.72] w-full object-cover" src={project.image} alt="Product overview"/>
    </section>

    <section class="grid gap-10 border-b border-black/10 py-10 lg:grid-cols-[.72fr_1.28fr]">
      <div><p class="text-[11px] uppercase tracking-[.2em] text-black/45">02 · The problem</p><h2 class="mt-5 text-[36px] font-light leading-[1.1] tracking-[-0.035em]">Unstructured conversations don’t scale.</h2><p class="mt-5 text-[15px] leading-7 text-black/56">Important information from meetings is often lost. Teams struggle to find decisions, track action items, and build on past discussions.</p></div>
      <div class="grid md:grid-cols-3">
        {#each [['01','Unstructured data'],['02','Lost context'],['03','No continuity']] as x}
          <div class="border border-black/10 p-7 text-center"><span class="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#eceee8] text-[11px]">{x[0]}</span><h3 class="mt-5 text-[15px] font-semibold">{x[1]}</h3><p class="mt-3 text-[13px] leading-5 text-black/50">Meeting context should stay searchable, structured, and useful after the call ends.</p></div>
        {/each}
      </div>
    </section>

    <section class="grid gap-10 border-b border-black/10 py-10 lg:grid-cols-[.72fr_1.28fr]">
      <div><p class="text-[11px] uppercase tracking-[.2em] text-black/45">03 · System architecture</p><h2 class="mt-5 text-[36px] font-light leading-[1.1] tracking-[-0.035em]">A scalable, event-driven architecture.</h2><p class="mt-5 text-[15px] leading-7 text-black/56">A modular architecture separates upload, transcription, AI processing, storage, and delivery so each stage can scale independently.</p></div>
      <div class="grid gap-3 md:grid-cols-3">
        {#each [['01','Web Client'],['02','API Server'],['03','Background Workers'],['04','PostgreSQL'],['05','Vector Search'],['06','Object Storage']] as x}
          <div class="border border-black/10 bg-white/40 p-6 text-center"><span class="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#eceee8] text-[11px]">{x[0]}</span><strong class="mt-4 block text-[14px]">{x[1]}</strong></div>
        {/each}
      </div>
    </section>

    <section class="grid gap-10 py-10 lg:grid-cols-[.72fr_1.28fr]">
      <div><p class="text-[11px] uppercase tracking-[.2em] text-black/45">04 · AI & retrieval</p><h2 class="mt-5 text-[36px] font-light leading-[1.1] tracking-[-0.035em]">From audio to actionable insights.</h2><p class="mt-5 text-[15px] leading-7 text-black/56">Audio is transcribed, chunked, embedded, retrieved, and converted into structured outputs grounded in meeting content.</p></div>
      <div class="grid gap-3 md:grid-cols-5">{#each ['1. Transcription','2. Chunking','3. Embeddings','4. Retrieval','5. Generation'] as x}<div class="border border-black/10 p-5 text-[13px] font-semibold">{x}</div>{/each}</div>
    </section>

    <section class="border-t border-black/10 py-9"><p class="text-[11px] uppercase tracking-[.2em] text-black/45">Tech stack</p><div class="mt-5"><TechChips items={['React','NestJS','PostgreSQL','pgvector','Redis','S3','LangGraph','OpenTelemetry']} pills/></div></section>
  </PageShell>
</main>
