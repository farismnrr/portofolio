<script lang="ts">
  const sections = ['Introduction','Event Boundaries','Delivery Guarantees','Idempotency','Retries','Dead Letter Queues','Observability','Lessons Learned','Conclusion'];
  const idempotencyExample = 'if already_processed(event.id) { return; }';
</script>

<main class="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[170px_1fr] lg:px-8">
  <aside class="hidden lg:block">
    <div class="sticky top-24">
      <p class="text-[10px] font-semibold uppercase tracking-[.2em]">On this page</p>
      <ul class="menu menu-xs mt-3 border-l border-base-300">{#each sections as s}<li><a href={'#'+s.toLowerCase().replaceAll(' ','-')}>{s}</a></li>{/each}</ul>
    </div>
  </aside>

  <article class="max-w-none">
    <p class="text-[10px] font-semibold uppercase tracking-[.2em] text-base-content/55">Architecture · Apr 12, 2024 · 12 min read</p>
    <h1 class="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">Designing Reliable Event-Driven Systems</h1>
    <p class="mt-4 text-xl leading-8 text-base-content/60">Key principles, patterns, and practical lessons for building event-driven systems that are scalable, observable, and resilient in the real world.</p>
    <img class="mt-7 aspect-[2.6] w-full bg-base-200 object-cover" src="/images/project-meeting.svg" alt="Event-driven system"/>

    <h2 id="introduction" class="mt-8 text-3xl font-semibold">Introduction</h2>
    <p class="mt-3 leading-7 text-base-content/65">Event-driven systems have become a foundational architecture for modern applications. They help decouple services, improve scalability, and enable real-time capabilities.</p>
    <div class="alert my-6 rounded-none"><span>Event-driven architecture is about designing for change, failure, and the long term.</span></div>

    <h2 id="event-boundaries" class="mt-8 text-3xl font-semibold">Event Boundaries</h2>
    <p class="mt-3 leading-7 text-base-content/65">A good event starts with a well-defined boundary. Events should represent meaningful business occurrences rather than internal implementation details.</p>
    <div class="card my-6 rounded-none border border-base-300 bg-base-200 p-6 text-center">Order Service → <strong>Event Bus</strong> → Inventory Service / Notification Service</div>

    <h2 id="delivery-guarantees" class="mt-8 text-3xl font-semibold">Delivery Guarantees</h2>
    <div class="mt-4 overflow-x-auto"><table class="table table-sm"><thead><tr><th>Guarantee</th><th>Description</th><th>Use cases</th></tr></thead><tbody><tr><td>At most once</td><td>Messages may be lost.</td><td>Telemetry</td></tr><tr><td>At least once</td><td>Delivered one or more times.</td><td>Application events</td></tr><tr><td>Exactly once</td><td>Delivered exactly once.</td><td>Critical workflows</td></tr></tbody></table></div>

    <h2 id="idempotency" class="mt-8 text-3xl font-semibold">Idempotency</h2>
    <p class="mt-3 leading-7 text-base-content/65">Consumers must be able to process the same event multiple times without causing incorrect side effects.</p>
    <div class="mockup-code my-6 rounded-none"><pre data-prefix="$"><code>{idempotencyExample}</code></pre><pre data-prefix=">"><code>process(event);</code></pre></div>

    <h2 id="retries" class="mt-8 text-3xl font-semibold">Retries</h2>
    <p class="mt-3 leading-7 text-base-content/65">Use exponential backoff and a maximum number of attempts. Retries should be deliberate and observable.</p>
    <div class="mockup-code my-6 rounded-none"><pre data-prefix="$"><code>retry_with_backoff(job, max_attempts = 5)</code></pre></div>

    <h2 id="dead-letter-queues" class="mt-8 text-3xl font-semibold">Dead Letter Queues</h2>
    <div class="alert mt-4 rounded-none"><span>A DLQ is a safety net. Monitor it and have a process for revisiting failed messages.</span></div>

    <h2 id="observability" class="mt-8 text-3xl font-semibold">Observability</h2>
    <ul class="mt-3 list-disc space-y-2 pl-6 text-base-content/65"><li>Track throughput, latency, and failure rates.</li><li>Include correlation IDs.</li><li>Use tracing across service boundaries.</li></ul>

    <h2 id="lessons-learned" class="mt-8 text-3xl font-semibold">Lessons Learned</h2>
    <ul class="mt-3 list-disc space-y-2 pl-6 text-base-content/65"><li>Keep schemas simple.</li><li>Invest in observability early.</li><li>Document contracts and versioning.</li></ul>

    <h2 id="conclusion" class="mt-8 text-3xl font-semibold">Conclusion</h2>
    <p class="mt-3 leading-7 text-base-content/65">Reliability comes from deliberate boundaries, failure handling, idempotency, retries, and observability.</p>
  </article>
</main>
