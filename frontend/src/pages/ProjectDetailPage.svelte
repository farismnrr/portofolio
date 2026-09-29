<script lang="ts">
  import AppIcon from '../lib/ui/AppIcon.svelte';
  import { navigate } from '../lib/router';
  import TechChips from '../lib/ui/TechChips.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
  import ArchitectureDiagram from '../lib/ui/ArchitectureDiagram.svelte';
  import ProcessFlow from '../lib/ui/ProcessFlow.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
  import { projects } from '../lib/data';

  const project = projects[0];

  const architecture = [
    { label:'Web Client', meta:'React' },
    { label:'API Server', meta:'NestJS' },
    { label:'Background Workers', meta:'LangGraph' },
    { label:'PostgreSQL', meta:'Primary data' },
    { label:'Vector Search', meta:'pgvector' },
    { label:'Object Storage', meta:'S3 audio files' }
  ];

  const flow = [
    { title:'Transcription', description:'Convert audio to text with timestamps and speaker context.' },
    { title:'Chunking', description:'Split transcripts into semantically meaningful sections.' },
    { title:'Embeddings', description:'Generate vector representations for semantic retrieval.' },
    { title:'Retrieval', description:'Fetch relevant context for the current task.' },
    { title:'Generation', description:'Produce summaries, decisions, and structured action items.' }
  ];
</script>

<main>
  <PageShell className="py-12">
    <a class="flex items-center gap-2 text-[12px] text-black/55 hover:text-black" href="/projects" on:click={(e)=>navigate(e,'/projects')}><AppIcon name="arrow-left" size={14}/>View all projects</a>

    <section class="mt-8 grid gap-12 border-b border-black/10 pb-12 lg:grid-cols-[.72fr_1.28fr]">
      <div>
        <p class="text-[11px] uppercase tracking-[.2em] text-black/45">2026</p>
        <h1 class="mt-5 text-[52px] font-semibold leading-[1] tracking-[-0.045em]">Sensio Notes</h1>
        <p class="mt-3 text-[28px] font-light text-black/58">Meeting Intelligence Platform</p>
        <p class="mt-4 text-[13px] text-black/50">Software Engineer · AI / Backend / Infrastructure</p>
        <p class="mt-6 max-w-xl text-[15px] leading-7 text-black/57">An AI-powered meeting intelligence platform that transcribes, understands, and organizes conversations into actionable insights, helping teams move from discussion to decisions.</p>
        <div class="mt-7 flex gap-3"><a class="btn btn-neutral rounded-none border-0 bg-[#344534] px-7 font-normal" href="https://example.com">Visit Product ↗</a><a class="btn btn-outline rounded-none border-black/20 px-7 font-normal" href="https://github.com">View Code</a></div>
      </div>
      <MediaImage className="aspect-[1.72] w-full" src={project.image} alt="Meeting intelligence platform" eager/>
    </section>

    <section class="grid gap-10 border-b border-black/10 py-10 lg:grid-cols-[.72fr_1.28fr]">
      <div><p class="text-[11px] uppercase tracking-[.2em] text-black/45">01 · Project overview</p><h2 class="mt-5 text-[38px] font-light leading-[1.1] tracking-[-0.035em]">Turn conversations<br/>into progress.</h2><p class="mt-5 max-w-lg text-[15px] leading-7 text-black/56">The platform transcribes conversations, extracts key insights, and generates summaries, action items, and searchable knowledge from meetings.</p></div>
      <MediaImage className="aspect-[1.72] w-full" src={project.image} alt="Product overview"/>
    </section>

    <section class="grid gap-10 border-b border-black/10 py-10 lg:grid-cols-[.72fr_1.28fr]">
      <div><p class="text-[11px] uppercase tracking-[.2em] text-black/45">02 · The problem</p><h2 class="mt-5 text-[36px] font-light leading-[1.1] tracking-[-0.035em]">Unstructured conversations don’t scale.</h2><p class="mt-5 text-[15px] leading-7 text-black/56">Important information from meetings is often lost. Teams struggle to find decisions, track action items, and build on past discussions.</p></div>
      <div class="grid gap-3 md:grid-cols-3">
        {#each [
          ['01','Unstructured data','Searchable context is scattered across long conversations.'],
          ['02','Lost context','Decisions and rationale disappear after the meeting ends.'],
          ['03','No continuity','Teams struggle to build on prior discussions consistently.']
        ] as x}
          <div class="border border-black/10 bg-white/35 p-7">
            <span class="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9ede5] text-[11px] text-black/60">{x[0]}</span>
            <h3 class="mt-5 text-[15px] font-semibold">{x[1]}</h3>
            <p class="mt-3 text-[13px] leading-5 text-black/50">{x[2]}</p>
          </div>
        {/each}
      </div>
    </section>

    <section class="grid gap-10 border-b border-black/10 py-12 lg:grid-cols-[.72fr_1.28fr]">
      <div>
        <p class="text-[11px] uppercase tracking-[.2em] text-black/45">03 · System architecture</p>
        <h2 class="mt-5 text-[36px] font-light leading-[1.08] tracking-[-0.035em]">A scalable, event-driven architecture.</h2>
        <p class="mt-5 max-w-lg text-[15px] leading-7 text-black/56">The system separates request handling, background processing, retrieval, and storage so each workload can scale and fail independently.</p>
        <p class="mt-5 max-w-lg text-[13px] leading-6 text-black/42">Upload and API paths stay responsive while long-running transcription and AI workloads are processed asynchronously.</p>
      </div>
      <ArchitectureDiagram nodes={architecture}/>
    </section>

    <section class="grid gap-10 border-b border-black/10 py-12 lg:grid-cols-[.72fr_1.28fr]">
      <div>
        <p class="text-[11px] uppercase tracking-[.2em] text-black/45">04 · AI & retrieval</p>
        <h2 class="mt-5 text-[36px] font-light leading-[1.08] tracking-[-0.035em]">From audio to actionable insights.</h2>
        <p class="mt-5 max-w-lg text-[15px] leading-7 text-black/56">The AI pipeline turns raw meeting audio into grounded, searchable knowledge without hiding the intermediate reasoning steps.</p>
        <p class="mt-5 max-w-lg text-[13px] leading-6 text-black/42">Every generated output is tied back to transcript context, making summaries and action items easier to verify.</p>
      </div>
      <ProcessFlow steps={flow}/>
    </section>

    <section class="py-10">
      <div class="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
        <div>
          <p class="text-[11px] uppercase tracking-[.2em] text-black/45">05 · Reliability</p>
          <h2 class="mt-5 text-[30px] font-light leading-[1.1] tracking-[-0.03em]">Built for real-world usage.</h2>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {#each [
            ['Background processing','Async workers keep uploads and APIs responsive.'],
            ['Retry behavior','Transient failures back off and retry safely.'],
            ['Upload recovery','Interrupted uploads can resume without starting over.'],
            ['Observability','Logs, metrics, and traces surface system health.']
          ] as item}
            <div class="border-t border-black/15 pt-4">
              <h3 class="text-[13px] font-semibold">{item[0]}</h3>
              <p class="mt-2 text-[12px] leading-5 text-black/48">{item[1]}</p>
            </div>
          {/each}
        </div>
      </div>
    </section>

    <section class="border-t border-black/10 py-9">
      <div class="grid gap-6 lg:grid-cols-[.72fr_1.28fr]">
        <p class="text-[11px] uppercase tracking-[.2em] text-black/45">Tech stack</p>
        <TechChips items={['React','NestJS','PostgreSQL','pgvector','Redis','S3','LangGraph','OpenTelemetry']} pills/>
      </div>
    </section>
  </PageShell>
</main>
