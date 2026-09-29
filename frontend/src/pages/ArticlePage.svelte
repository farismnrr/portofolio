<script lang="ts">
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
  import { projects } from '../lib/project-content';
  const sections=['Introduction','Event Boundaries','Delivery Guarantees','Idempotency','Retries','Dead Letter Queues','Observability','Lessons Learned','Conclusion'];
  const idempotencyExample='if already_processed(event.id) { return; }';
</script>

<main>
  <PageShell className="py-10">
    <div class="grid gap-12 lg:grid-cols-[190px_1fr]">
      <aside class="hidden lg:block"><div class="sticky top-24"><p class="text-[10px] font-semibold uppercase tracking-[.2em] text-black/50">On this page</p><ul class="mt-4 border-l border-black/12">{#each sections as s}<li><a class="block border-l border-transparent px-4 py-2 text-[12px] text-black/52 hover:text-black" href={'#'+s.toLowerCase().replaceAll(' ','-')}>{s}</a></li>{/each}</ul></div></aside>

      <article class="mx-auto w-full max-w-[1000px]">
        <p class="text-[11px] font-semibold uppercase tracking-[.18em] text-black/45">Architecture · Apr 12, 2024 · 12 min read</p>
        <h1 class="mt-4 text-[48px] font-semibold leading-[1.02] tracking-[-0.045em] md:text-[62px]">Designing Reliable<br/>Event-Driven Systems</h1>
        <p class="mt-4 max-w-4xl text-[20px] leading-8 text-black/56">Key principles, patterns, and practical lessons for building event-driven systems that are scalable, observable, and resilient in the real world.</p>
        <MediaImage className="mt-8 aspect-[2.45] w-full" src={projects[0].image} alt="Event-driven system" eager/>

        <h2 id="introduction" class="mt-8 text-[30px] font-semibold tracking-[-0.03em]">Introduction</h2>
        <p class="mt-3 text-[15px] leading-7 text-black/60">Event-driven systems have become a foundational architecture for modern applications. They help decouple services, improve scalability, and enable real-time capabilities. But they also introduce new challenges around reliability, consistency, and observability.</p>
        <div class="my-6 border-l-2 border-[#43593f] bg-black/[0.025] px-6 py-4 text-[15px] italic text-black/58">Event-driven architecture isn’t just about sending messages — it’s about designing for change, failure, and the long term.</div>

        <h2 id="event-boundaries" class="mt-8 text-[30px] font-semibold tracking-[-0.03em]">Event Boundaries</h2>
        <p class="mt-3 text-[15px] leading-7 text-black/60">A good event starts with a well-defined boundary. Events should represent meaningful business occurrences that other services care about, not internal implementation details.</p>
        <div class="my-6 flex items-center justify-center gap-5 border border-black/10 bg-white/40 p-7 text-[13px]"><span class="border border-black/15 px-5 py-4">Order Service</span><span>→</span><strong class="bg-[#465d3f] px-6 py-4 text-white">Event Bus</strong><span>→</span><span class="border border-black/15 px-5 py-4">Consumers</span></div>

        <h2 id="delivery-guarantees" class="mt-8 text-[30px] font-semibold tracking-[-0.03em]">Delivery Guarantees</h2>
        <div class="mt-4 overflow-x-auto"><table class="table table-sm border border-black/10"><thead><tr><th>Guarantee Level</th><th>Description</th><th>Common Use Cases</th></tr></thead><tbody><tr><td>At most once</td><td>Messages may be lost, but never delivered twice.</td><td>Non-critical telemetry</td></tr><tr><td>At least once</td><td>Messages are delivered one or more times.</td><td>Most application events</td></tr><tr><td>Exactly once</td><td>Messages are delivered exactly once.</td><td>Critical workflows</td></tr></tbody></table></div>

        <h2 id="idempotency" class="mt-8 text-[30px] font-semibold tracking-[-0.03em]">Idempotency</h2>
        <p class="mt-3 text-[15px] leading-7 text-black/60">Since many systems provide at-least-once delivery, consumers must be able to process the same event multiple times without causing incorrect side effects.</p>
        <div class="mockup-code my-6 rounded-none"><pre data-prefix="$"><code>{idempotencyExample}</code></pre><pre data-prefix=">"><code>process(event);</code></pre></div>

        <h2 id="retries" class="mt-8 text-[30px] font-semibold tracking-[-0.03em]">Retries</h2>
        <p class="mt-3 text-[15px] leading-7 text-black/60">Retries help handle transient failures, but they need to be designed carefully to avoid overwhelming systems. Use exponential backoff and a maximum number of attempts.</p>

        <h2 id="dead-letter-queues" class="mt-8 text-[30px] font-semibold tracking-[-0.03em]">Dead Letter Queues</h2>
        <div class="mt-4 border-l-2 border-[#43593f] bg-black/[0.025] px-6 py-4 text-[14px] text-black/58">A DLQ is not a solution — it’s a safety net. Make sure to monitor it and have a process to revisit failed messages.</div>

        <h2 id="observability" class="mt-8 text-[30px] font-semibold tracking-[-0.03em]">Observability</h2>
        <ul class="mt-3 list-disc space-y-2 pl-6 text-[15px] leading-6 text-black/60"><li>Track event throughput, processing latency, and failure rates.</li><li>Include correlation IDs in logs and events.</li><li>Use tracing to follow requests across service boundaries.</li></ul>

        <h2 id="lessons-learned" class="mt-8 text-[30px] font-semibold tracking-[-0.03em]">Lessons Learned</h2>
        <ul class="mt-3 list-disc space-y-2 pl-6 text-[15px] leading-6 text-black/60"><li>Keep event schemas simple and focused.</li><li>Invest in good tooling and observability early.</li><li>Document event contracts and versioning strategy.</li></ul>

        <h2 id="conclusion" class="mt-8 text-[30px] font-semibold tracking-[-0.03em]">Conclusion</h2>
        <p class="mt-3 text-[15px] leading-7 text-black/60">Event-driven systems can unlock significant benefits, but reliability doesn’t happen by accident. Clear boundaries, idempotency, retries, dead-letter queues, and strong observability make them resilient in practice.</p>
      </article>
    </div>
  </PageShell>
</main>
