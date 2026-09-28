<script lang="ts">
  import { onMount } from 'svelte';

  type Experience = { year:string; company:string; role:string; text:string; bullets:string[]; tech:string[] };
  type Project = { id:string; year:string; title:string; subtitle:string; image:string; description:string; role:string; category:string; tech:string[] };

  const nav = [
    ['Home','/'], ['About','/about'], ['Projects','/projects'], ['Blog','/blog'],
    ['Certifications','/certifications'], ['Gallery','/gallery']
  ];

  const experiences: Experience[] = [
    { year:'2025 — Present', company:'Northstar Systems', role:'Senior Software Engineer', text:'Working on backend services, IoT infrastructure, and AI-powered workflows for global products.', bullets:['Designed production-grade services for real-time device communication.','Developed event pipelines for millions of device events.','Implemented retrieval-augmented AI workflows.','Introduced distributed tracing and structured telemetry.'], tech:['Rust','PostgreSQL','MQTT','Redis','Docker','OpenTelemetry'] },
    { year:'2024 — 2025', company:'Atlas Labs', role:'Machine Learning Engineer', text:'Built and deployed machine learning solutions for real-world applications and production systems.', bullets:['Developed end-to-end ML pipelines.','Designed practical evaluation frameworks.','Deployed scalable inference services.','Collaborated closely with product and engineering teams.'], tech:['Python','TensorFlow','ML Pipelines','Evaluation','Inference APIs'] },
    { year:'2023 — 2024', company:'Orbit Technologies', role:'Backend Engineer', text:'Developed distributed backend services for an IoT and enterprise platform.', bullets:['Designed scalable microservices.','Built event-driven telemetry pipelines.','Optimized database queries and reliability.','Worked on distributed systems and fault tolerance.'], tech:['Rust','PostgreSQL','Distributed Systems'] },
    { year:'2022 — 2023', company:'Studio North', role:'Technical SEO Engineer', text:'Worked on technical SEO and site performance for content-driven products.', bullets:['Conducted technical audits.','Implemented site architecture improvements.','Improved observability and web performance.','Partnered with content and engineering teams.'], tech:['Analytics','Technical SEO','Site Architecture'] }
  ];

  const projects: Project[] = [
    { id:'01 / 08', year:'2025', title:'Sensio Notes', subtitle:'Meeting Intelligence Platform', image:'/images/project-meeting.svg', description:'AI-powered meeting transcription, summarization, and action item tracking for modern teams.', role:'Lead Engineer', category:'AI · Productivity', tech:['Python','FastAPI','OpenAI','PostgreSQL','Svelte','Redis'] },
    { id:'02 / 08', year:'2024', title:'Sensio IoT', subtitle:'Smart-space control platform', image:'/images/project-iot.svg', description:'End-to-end platform for connected spaces, from device firmware to cloud infrastructure and real-time dashboards.', role:'Full Stack Engineer', category:'IoT · Infrastructure', tech:['Rust','MQTT','AWS','InfluxDB','Svelte'] },
    { id:'03 / 08', year:'2024', title:'Agentic Workspace', subtitle:'Autonomous coding environment', image:'/images/project-agent.svg', description:'An AI-native development environment with autonomous agents for code generation, testing, and project understanding.', role:'Core Developer', category:'Developer Tools · AI', tech:['TypeScript','Node.js','LangChain','PostgreSQL','Svelte'] },
    { id:'04 / 08', year:'2023', title:'Learning Worlds', subtitle:'Game-based education platform', image:'/images/project-game.svg', description:'Interactive learning platform using game mechanics to teach programming and problem-solving.', role:'Software Engineer', category:'EdTech · Gaming', tech:['Svelte','Rust','PostgreSQL','WebRTC','Three.js'] },
    { id:'05 / 08', year:'2023', title:'Tenant Core', subtitle:'Multi-tenant identity service', image:'/images/project-agent.svg', description:'Identity and access management service for multi-tenant applications with fine-grained permissions.', role:'Backend Engineer', category:'Infrastructure · Security', tech:['Rust','PostgreSQL','Redis','Kubernetes'] },
    { id:'06 / 08', year:'2024', title:'Observability Stack', subtitle:'Infrastructure monitoring platform', image:'/images/project-meeting.svg', description:'Distributed tracing, metrics, and logging platform for cloud-native services with real-time alerting.', role:'Backend Engineer', category:'Developer Tools · DevOps', tech:['Rust','Prometheus','Grafana','ClickHouse'] }
  ];

  const articles = [
    ['SEP 2026','Engineering','12 min read','Designing Reliable Event-Driven Systems','Patterns, trade-offs, and practical lessons from building event-driven systems at scale.'],
    ['AUG 2026','AI','10 min read','Building AI Features That Stay Grounded','How to design AI features with reliable context, guardrails, and evaluation loops.'],
    ['JUL 2026','Architecture','11 min read','Lessons from a Multi-Tenant Architecture','Key design decisions, challenges, and what I would do differently.'],
    ['MAY 2026','IoT','9 min read','Running IoT Systems in the Real World','Practical lessons from deploying and operating connected devices at scale.'],
    ['APR 2026','Backend','8 min read','Why Background Jobs Fail','Common failure modes in background processing systems and resilient patterns.'],
    ['MAR 2026','Observability','10 min read','Observability Beyond Logging','Moving from logs to metrics, tracing, and structured context.']
  ];

  const certGroups = [
    ['Cloud Computing',3,[['Google Cloud','Cloud Computing Professional','2025'],['Alibaba Cloud','Cloud Native Developer','2023'],['AWS','Solutions Architect Associate','2023']]],
    ['Software Engineering',2,[['Dicoding','Backend Engineering Expert','2024'],['Meta','Back-End Developer Professional Certificate','2024']]],
    ['Machine Learning & AI',2,[['Coursera','Machine Learning Specialization','2024'],['Google','TensorFlow Developer Certificate','2023']]],
    ['Security',1,[['CompTIA','Security+','2023']]],
    ['Professional Programs',1,[['Google','Project Management Professional Certificate','2023']]]
  ] as const;

  const gallery = [
    ['/images/project-game.svg','Jakarta — 2026'], ['/images/project-meeting.svg','Workspace'],
    ['/images/profile.svg','Night Walk'], ['/images/project-iot.svg','Prototype 04'],
    ['/images/project-game.svg','Somewhere Above'], ['/images/project-meeting.svg','Tokyo — 2025'],
    ['/images/profile.svg','Conference'], ['/images/project-game.svg','Mount Bromo — 2024'],
    ['/images/project-iot.svg','Good Coffee'], ['/images/project-meeting.svg','Bangkok — 2024'],
    ['/images/project-game.svg','Fuji — 2025'], ['/images/project-iot.svg','Nusa Penida — 2024'],
    ['/images/project-agent.svg','Build Session'], ['/images/project-game.svg','On to the Next']
  ];

  let path = '/';

  function navigate(event: MouseEvent, href: string) {
    if (href.startsWith('http') || href.startsWith('mailto:')) return;
    event.preventDefault();
    history.pushState({}, '', href);
    path = location.pathname;
    window.scrollTo({top:0,behavior:'instant'});
  }

  onMount(() => {
    path = location.pathname;
    const pop = () => path = location.pathname;
    addEventListener('popstate', pop);
    return () => removeEventListener('popstate', pop);
  });

  $: active = path.startsWith('/projects') ? 'Projects'
    : path.startsWith('/blog') ? 'Blog'
    : path.startsWith('/certifications') ? 'Certifications'
    : path.startsWith('/gallery') ? 'Gallery'
    : path.startsWith('/about') || path.startsWith('/experience') || path.startsWith('/foundation') ? 'About'
    : 'Home';
</script>

<svelte:head><title>Alex Morgan — Software Engineer</title></svelte:head>

<header class="site-header">
  <a class="brand" href="/" on:click={(e)=>navigate(e,'/')}>AM</a>
  <nav aria-label="Primary">
    {#each nav as item}
      <a class:active={active===item[0]} href={item[1]} on:click={(e)=>navigate(e,item[1])}>{item[0]}</a>
    {/each}
  </nav>
  <div class="header-actions"><a href="https://github.com">●</a><a href="https://linkedin.com">in</a><span class="divider"></span><button>☼</button></div>
</header>

{#if path === '/'}
<main>
  <section class="hero shell">
    <div class="hero-copy">
      <p class="eyebrow">SOFTWARE ENGINEER · BACKEND · AI · IOT</p>
      <h1>Alex Morgan</h1>
      <p class="headline">Building reliable systems<br/>for complex problems.</p>
      <p class="lede">A software engineer working across backend architecture, intelligent systems, cloud infrastructure, and connected devices.</p>
      <div class="hero-cta"><a class="button button-dark" href="/projects" on:click={(e)=>navigate(e,'/projects')}>View Projects →</a><a class="button" href="mailto:hello@example.com">Contact</a></div>
      <div class="availability"><span>⌖ Jakarta, Indonesia</span><span><i></i>Available for selected opportunities</span></div>
      <div class="socials"><a href="https://github.com">● GitHub</a><a href="https://linkedin.com">in LinkedIn</a><a href="mailto:hello@example.com">✉ Email</a></div>
    </div>
    <div class="hero-visual"><img src="/images/profile.svg" alt="Profile"/><blockquote>“Better systems create<br/>more possibilities.”</blockquote></div>
  </section>

  <section class="section shell">
    <div class="section-title-row"><p class="section-kicker">SELECTED EXPERIENCE</p><a href="/experience" on:click={(e)=>navigate(e,'/experience')}>View full experience →</a></div>
    {#each experiences.slice(0,3) as item, index}
      <article class="experience-item compact"><div class="experience-year">{item.year}</div><div class="timeline"><span class:filled={index===0}></span></div><div><h3>{item.role}</h3><p class="muted">{item.company}</p></div><p class="experience-text">{item.text}</p></article>
    {/each}
  </section>

  <section class="section shell">
    <div class="section-title-row"><p class="section-kicker">SELECTED PROJECTS</p><a href="/projects" on:click={(e)=>navigate(e,'/projects')}>View all projects →</a></div>
    <div class="project-grid">
      {#each projects.slice(0,4) as p}<article class="project-card"><a href="/projects/sensio-notes" on:click={(e)=>navigate(e,'/projects/sensio-notes')}><img src={p.image} alt=""/><p class="project-meta">{p.id.split(' / ')[0]} / {p.year}</p><h2>{p.title}</h2></a><p class="project-description">{p.description}</p><div class="detail-row"><span>Role</span><strong>{p.role}</strong></div><div class="detail-row"><span>Tech</span><div>{#each p.tech as t}<small>{t}</small>{/each}</div></div></article>{/each}
    </div>
  </section>
  <section class="about-summary shell"><div><p class="section-kicker">ABOUT</p><h2>I care about software that<br/>remains understandable<br/>after it grows.</h2></div><div class="about-copy"><p>I’m a software engineer who enjoys building systems at the intersection of backend infrastructure, intelligent systems, and connected devices.</p><a href="/about" on:click={(e)=>navigate(e,'/about')}>More about me →</a></div></section>
</main>

{:else if path === '/about'}
<main class="shell page about-page">
  <aside class="profile-rail"><img src="/images/profile.svg" alt="Profile"/><h2>Alex Morgan</h2><p>Software Engineer</p><div class="rail-links"><span>⌖ Jakarta, Indonesia</span><span>◎ English, Bahasa Indonesia</span><hr/><a href="https://github.com">● GitHub</a><a href="https://linkedin.com">in LinkedIn</a><a href="mailto:hello@example.com">✉ Email</a><span>▧ Download Resume</span></div></aside>
  <section class="about-main">
    <p class="eyebrow">ABOUT ME</p><h1>About</h1><p class="display-copy">I build systems that connect applications, infrastructure, intelligence, and real-world devices.</p>
    <p>I’m a software engineer with a focus on backend architecture, distributed systems, and applied AI. I enjoy building reliable, scalable systems that bridge the digital and physical world.</p><p>My work sits at the intersection of backend engineering, machine learning, and the Internet of Things.</p>
    <div class="section-title-row bordered"><p class="section-kicker">WORK EXPERIENCE</p><a href="/experience" on:click={(e)=>navigate(e,'/experience')}>View full experience →</a></div>
    {#each experiences.slice(0,2) as x, i}<article class="experience-detail"><div class="experience-year">{x.year}</div><div class="timeline"><span class:filled={i===0}></span></div><div><h2>{x.company}</h2><h3>{x.role}</h3><p>{x.text}</p><ul>{#each x.bullets as b}<li>{b}</li>{/each}</ul><p class="tech-label">TECHNOLOGIES</p><div class="chips">{#each x.tech as t}<span>{t}</span>{/each}</div></div></article>{/each}
  </section>
</main>

{:else if path === '/experience'}
<main class="page shell">
  <section class="page-hero two-col"><div><p class="eyebrow">WORK EXPERIENCE</p><h1>Professional experience</h1><p class="display-copy">A journey of building, learning,<br/>and solving real-world problems.</p></div><p>I've worked across different stages of the stack, from backend systems to cloud infrastructure, and contributed to products used by real people.</p></section>
  <section class="timeline-page">{#each experiences as x, i}<article class="experience-detail"><div class="experience-year">{x.year}</div><div class="timeline"><span class:filled={i===0}></span></div><div><h2>{x.company}</h2><h3>{x.role}</h3><p>{x.text}</p><ul>{#each x.bullets as b}<li>{b}</li>{/each}</ul><div class="chips"><b>Tech</b>{#each x.tech as t}<span>{t}</span>{/each}</div></div></article>{/each}</section>
  <section class="page-hero two-col mini"><div><p class="eyebrow">EDUCATION</p><h1>Education</h1><p class="display-copy">A strong foundation<br/>for continuous growth.</p></div><p>My academic journey gave me a solid foundation in computer science, problem solving, and systems thinking.</p></section>
</main>

{:else if path === '/foundation'}
<main class="page shell">
  <section class="foundation-grid"><div><p class="eyebrow">EDUCATION</p><h1>Academic<br/>Foundation</h1><p class="lede">A strong foundation in computer science and electronics, which shaped my problem-solving mindset.</p></div><div class="edu-list"><article><b>2020 — 2024</b><div><h2>University of Technology</h2><p>Bachelor of Computer Science</p><p>Focused on software engineering, distributed systems, and artificial intelligence.</p></div></article><article><b>2017 — 2020</b><div><h2>Technical Institute</h2><p>Electronics & Communications</p><p>Built a strong foundation in embedded systems and hardware fundamentals.</p></div></article></div></section>
  <section class="section"><p class="eyebrow">TECHNICAL SKILLS</p><h1 class="section-heading">Tools and Technologies</h1><p class="lede">A curated set of technologies I work with to design, build, and operate reliable systems.</p><div class="skills-grid">{#each [['LANGUAGES',['Go','Rust','TypeScript','Python','C++']],['BACKEND',['Axum','Actix','Node.js','REST','gRPC']],['FRONTEND',['Svelte','React','Vue','Next.js']],['DATA',['PostgreSQL','Redis','MySQL','SQLite','Vector Search']],['INFRASTRUCTURE',['Docker','Linux','AWS','GCP','CI/CD','OpenTelemetry']],['AI',['RAG','LLM orchestration','Embeddings','LangGraph','TensorFlow']],['IOT',['MQTT','ESP32','Telemetry','Real-time systems']]] as s}<div><h3>{s[0]}</h3><p>{(s[1] as string[]).join('  ·  ')}</p></div>{/each}</div></section>
  <section class="section"><p class="eyebrow">ENGINEERING PRINCIPLES</p><h1 class="section-heading">Principles I Work By</h1><div class="principles">{#each ['Build systems that remain understandable.','Prefer explicit architecture over accidental complexity.','Measure before optimizing.','Reliability is part of the product.','AI outputs should remain grounded in evidence.','Design around real-world constraints.'] as p, i}<article><span>{String(i+1).padStart(2,'0')}</span><div><h3>{p}</h3><p>Clarity, evidence, and practical trade-offs guide how I build maintainable systems.</p></div></article>{/each}</div></section>
  <section class="cta-band"><div><p class="eyebrow">LET'S CONNECT</p><h1>Interested in working together?</h1><p>I’m always open to discussing new opportunities, interesting projects, or just having a conversation about technology and ideas.</p><div class="hero-cta"><a class="button button-dark" href="/projects" on:click={(e)=>navigate(e,'/projects')}>View Projects →</a><a class="button" href="mailto:hello@example.com">Contact Me</a></div></div><img src="/images/project-meeting.svg" alt=""/></section>
</main>

{:else if path === '/projects'}
<main class="page shell">
  <section class="page-hero two-col"><div><p class="eyebrow">SELECTED WORK</p><h1>Projects</h1><p class="display-copy">Real systems. Real impact.</p><p class="lede">A collection of software systems I've designed, built, and shipped across backend infrastructure, intelligent systems, cloud platforms, and connected devices.</p></div><div><p class="eyebrow">08 PROJECTS</p><p>From consumer-facing products to distributed infrastructure, these projects reflect my interest in building practical, scalable systems.</p></div></section>
  <div class="projects-list">{#each projects as p, i}<article class:featured={i===0} class="project-list-card"><a href="/projects/sensio-notes" on:click={(e)=>navigate(e,'/projects/sensio-notes')}><img src={p.image} alt=""/></a><div><p class="project-meta">{p.id} &nbsp;&nbsp; {p.year}</p><h2>{p.title}</h2><h3>{p.subtitle}</h3><p>{p.description}</p><div class="detail-row"><span>Role</span><strong>{p.role}</strong></div><div class="detail-row"><span>Category</span><strong>{p.category}</strong></div><div class="detail-row"><span>Tech</span><div>{#each p.tech as t}<small>{t}</small>{/each}</div></div>{#if i===0}<a class="button button-dark small-btn" href="/projects/sensio-notes" on:click={(e)=>navigate(e,'/projects/sensio-notes')}>View project →</a>{/if}</div></article>{/each}</div>
</main>

{:else if path.startsWith('/projects/')}
<main class="page shell project-detail">
  <section class="project-detail-hero"><div><a href="/projects" on:click={(e)=>navigate(e,'/projects')}>← View all projects</a><p class="project-meta">2026</p><h1>Sensio Notes</h1><p class="display-copy">Meeting Intelligence Platform</p><p>Software Engineer &nbsp; · &nbsp; AI / Backend / Infrastructure</p><p class="lede">An AI-powered meeting intelligence platform that transcribes, understands, and organizes conversations into actionable insights.</p><div class="hero-cta"><a class="button button-dark" href="/">Visit Product ↗</a><a class="button" href="https://github.com">View Code ●</a></div></div><img src="/images/project-meeting.svg" alt=""/></section>
  {#each [['01','PROJECT OVERVIEW','Turn conversations into progress.','Sensio Notes automatically generates summaries, action items, and searchable knowledge from meetings.'],['02','THE PROBLEM','Unstructured conversations don’t scale.','Important information from meetings is often lost in unstructured conversation and hard to find later.'],['03','SYSTEM ARCHITECTURE','A scalable, event-driven architecture.','A modular architecture processes meetings from upload to insights with separate services for transcription, AI processing, and storage.'],['04','AI & RETRIEVAL','From audio to actionable insights.','Audio is transcribed, chunked, embedded, retrieved with semantic search, and converted into structured outputs.'],['05','RELIABILITY','Built for real-world usage.','Background processing, retry behavior, upload recovery, progress events, and observability are designed in from the start.'],['06','TECH STACK','Tools and technologies.','Rust · Axum · PostgreSQL · pgvector · Redis · S3 · LangGraph · OpenTelemetry']] as s, i}<section class="case-section"><div><p class="project-meta">{s[0]} &nbsp;&nbsp; {s[1]}</p><h2>{s[2]}</h2><p>{s[3]}</p></div>{#if i<4}<img src={projects[i%projects.length].image} alt=""/>{:else}<div class="case-panel">{#each ['Background processing','Retry behavior','Upload recovery','Progress events','Observability'] as x}<span>◎<b>{x}</b></span>{/each}</div>{/if}</section>{/each}
</main>

{:else if path === '/blog'}
<main class="page shell">
  <section class="blog-hero"><p class="eyebrow">ENGINEERING JOURNAL</p><h1>Notes on software,<br/>systems, and things<br/><span>I learn while building them.</span></h1><p class="lede">Practical notes, technical deep dives, and lessons from building and operating real systems across backend, AI, cloud infrastructure, and connected devices.</p></section>
  <section class="featured-article"><div><p class="eyebrow">FEATURED</p><p>Engineering &nbsp; · &nbsp; 12 min read &nbsp; · &nbsp; Sep 2026</p><h2>Designing Reliable Event-Driven Systems</h2><p>Patterns, trade-offs, and practical lessons from building event-driven systems at scale.</p><a class="button button-dark" href="/blog/event-driven-systems" on:click={(e)=>navigate(e,'/blog/event-driven-systems')}>Read article →</a></div><img src="/images/project-meeting.svg" alt=""/></section>
  <section class="article-list"><div class="section-title-row"><p class="eyebrow">ALL ARTICLES</p><span>6 articles</span></div>{#each articles as a}<a href="/blog/event-driven-systems" on:click={(e)=>navigate(e,'/blog/event-driven-systems')}><span>{a[0]}</span><div><p>{a[1]} &nbsp; · &nbsp; {a[2]}</p><h2>{a[3]}</h2><p>{a[4]}</p></div><b>→</b></a>{/each}</section>
</main>

{:else if path.startsWith('/blog/')}
<main class="article-page shell">
  <aside class="toc"><p class="eyebrow">ON THIS PAGE</p>{#each ['Introduction','Event Boundaries','Delivery Guarantees','Idempotency','Retries','Dead Letter Queues','Observability','Lessons Learned','Conclusion'] as x}<span>{x}</span>{/each}</aside>
  <article class="prose"><p class="eyebrow">ARCHITECTURE · APR 12, 2024 · 12 MIN READ</p><h1>Designing Reliable<br/>Event-Driven Systems</h1><p class="display-copy">Key principles, patterns, and practical lessons for building event-driven systems that are scalable, observable, and resilient in the real world.</p><img src="/images/project-meeting.svg" alt=""/>
  <h2>Introduction</h2><p>Event-driven systems have become a foundational architecture for modern applications. They help decouple services, improve scalability, and enable real-time capabilities.</p><blockquote>“Event-driven architecture isn’t just about sending messages — it’s about designing for change, failure, and the long term.”</blockquote>
  <h2>Event Boundaries</h2><p>A good event starts with a well-defined boundary. Events should represent meaningful business occurrences that other services care about, not internal implementation details.</p><div class="diagram">Order Service → <b>Event Bus</b> → Inventory Service<br/>↳ Notification Service</div>
  <h2>Delivery Guarantees</h2><table><tbody><tr><th>Guarantee Level</th><th>Description</th><th>Common Use Cases</th></tr><tr><td>At most once</td><td>Messages may be lost.</td><td>Telemetry</td></tr><tr><td>At least once</td><td>Messages delivered one or more times.</td><td>Application events</td></tr><tr><td>Exactly once</td><td>Delivered exactly once.</td><td>Critical workflows</td></tr></tbody></table>
  <h2>Idempotency</h2><p>Consumers must be able to process the same event multiple times without causing incorrect side effects.</p><pre>{`fn handle_order_created(event: Event) {
  if already_processed(event.id) { return; }
  process(event);
}`}</pre>
  <h2>Retries</h2><p>Use exponential backoff and a maximum number of attempts. Retries should be deliberate and observable.</p><pre>retry_with_backoff(job, max_attempts = 5);</pre>
  <h2>Dead Letter Queues</h2><p>A DLQ is not a solution — it’s a safety net. Monitor it and have a process to revisit failed messages.</p><h2>Observability</h2><ul><li>Track event throughput and latency</li><li>Include correlation IDs</li><li>Use tracing across service boundaries</li></ul><h2>Lessons Learned</h2><ul><li>Keep event schemas simple.</li><li>Invest in observability early.</li><li>Document contracts and versioning.</li></ul><h2>Conclusion</h2><p>Reliability comes from deliberate boundaries, failure handling, idempotency, retries, and observability.</p></article>
</main>

{:else if path === '/certifications'}
<main class="page shell">
  <section class="blog-hero certifications-hero"><p class="eyebrow">RESUME · GROWTH · RECOGNITION</p><h1>Certifications & Achievements</h1><p class="display-copy">Credentials that validate my skills and continuous learning journey in software engineering, cloud, AI, and related technologies.</p></section>
  <div class="cert-groups">{#each certGroups as g}<section class="cert-group"><div class="cert-title"><h2>{g[0]}</h2><p>Certifications focused on practical skills and professional development.</p><span>{g[1]} credentials</span></div><div class="cert-grid">{#each g[2] as c}<article><div class="certificate"><b>{c[0]}</b><h3>{c[1]}</h3><span>PROFESSIONAL CERTIFICATE</span></div><h3>{c[1]}</h3><p>{c[0]}</p><p>{c[2]} &nbsp; · &nbsp; Credential ID: DEMO-{c[2]}-84217</p><a href="/">View Credential →</a></article>{/each}</div></section>{/each}</div>
</main>

{:else if path === '/gallery'}
<main class="page shell">
  <section class="blog-hero gallery-hero"><p class="eyebrow">PHOTOGRAPHY</p><h1>Gallery</h1><p class="display-copy">Places, people, ideas, and<br/>moments along the way.</p><p class="lede">A collection of photographs from my work, travels, and everyday life.</p></section>
  <div class="masonry">{#each gallery as g, i}<figure class:wide={i===0||i===7||i===12} class:tall={i===2||i===6}><img src={g[0]} alt=""/><figcaption>{g[1]}</figcaption></figure>{/each}</div>
</main>
{/if}

<footer class="footer shell"><div class="footer-brand"><strong>AM</strong><span>Alex Morgan<br/>Software Engineer</span></div><div class="footer-nav">{#each nav as item}<a href={item[1]} on:click={(e)=>navigate(e,item[1])}>{item[0]}</a>{/each}</div><div class="footer-right"><span>●</span><span>in</span><span>© 2026 Alex Morgan. All rights reserved.</span></div></footer>
