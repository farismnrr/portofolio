<script lang="ts">
  const experiences = [
    { year: '2025 — Present', role: 'Senior Software Engineer', company: 'Northstar Systems', text: 'Designing and scaling backend systems for global products, with a focus on reliability, performance, and developer experience.' },
    { year: '2024 — 2025', role: 'Machine Learning Engineer', company: 'Atlas Labs', text: 'Built and deployed ML-powered features for real-world applications, including LLM workflows and data infrastructure.' },
    { year: '2023 — 2024', role: 'Backend Engineer', company: 'Orbit Technologies', text: 'Developed and maintained distributed services and APIs for IoT and enterprise platforms.' }
  ];

  const projects = [
    { id: '01', year: '2025', title: 'Meeting Intelligence Platform', image: '/images/project-meeting.svg', description: 'AI-powered meeting transcription, summarization, and action item tracking for modern teams.', role: 'Lead Engineer', tech: ['Python', 'FastAPI', 'OpenAI', 'PostgreSQL', 'React'] },
    { id: '02', year: '2024', title: 'Smart Space IoT Platform', image: '/images/project-iot.svg', description: 'End-to-end platform for connected spaces, from device firmware to cloud infrastructure and real-time dashboards.', role: 'Full Stack Engineer', tech: ['Python', 'MQTT', 'AWS', 'InfluxDB', 'React'] },
    { id: '03', year: '2024', title: 'Agentic Coding Workspace', image: '/images/project-agent.svg', description: 'An AI-native development environment with autonomous agents for code generation, testing, and project understanding.', role: 'Core Developer', tech: ['TypeScript', 'Node.js', 'LangChain', 'PostgreSQL', 'React'] },
    { id: '04', year: '2023', title: 'Game-Based Learning Platform', image: '/images/project-game.svg', description: 'Interactive learning platform using game mechanics to teach programming and problem-solving.', role: 'Software Engineer', tech: ['Svelte', 'Rust', 'WebRTC', 'Three.js'] }
  ];

  const nav = ['Home', 'About', 'Projects', 'Blog', 'Certifications', 'Gallery'];
</script>

<svelte:head>
  <title>Alex Morgan — Software Engineer</title>
</svelte:head>

<header class="site-header">
  <a class="brand" href="#home">AM</a>
  <nav aria-label="Primary">
    {#each nav as item}
      <a class:active={item === 'Home'} href={'#' + item.toLowerCase()}>{item}</a>
    {/each}
  </nav>
  <div class="header-actions">
    <a aria-label="GitHub" href="https://github.com">◉</a>
    <a aria-label="LinkedIn" href="https://linkedin.com">in</a>
    <span class="divider"></span>
    <button aria-label="Toggle theme" type="button">☼</button>
  </div>
</header>

<main id="home">
  <section class="hero shell">
    <div class="hero-copy">
      <p class="eyebrow">SOFTWARE ENGINEER · BACKEND · AI · IOT</p>
      <h1>Alex Morgan</h1>
      <p class="headline">Building reliable systems<br />for complex problems.</p>
      <p class="lede">A software engineer working across backend architecture, intelligent systems, cloud infrastructure, and connected devices.</p>

      <div class="hero-cta">
        <a class="button button-dark" href="#projects">View Projects <span>→</span></a>
        <a class="button button-light" href="mailto:hello@example.com">Contact</a>
      </div>

      <div class="availability">
        <span>⌖ Jakarta, Indonesia</span>
        <span><i></i> Available for selected opportunities</span>
      </div>

      <div class="socials">
        <a href="https://github.com">◉ GitHub</a>
        <a href="https://linkedin.com">in LinkedIn</a>
        <a href="mailto:hello@example.com">✉ Email</a>
      </div>
    </div>

    <div class="hero-visual">
      <img src="/images/profile.svg" alt="Portrait placeholder" />
      <blockquote>“Better systems create<br />more possibilities.”</blockquote>
    </div>
  </section>

  <section class="section shell" id="about">
    <div class="section-title-row">
      <p class="section-kicker">SELECTED EXPERIENCE</p>
      <a href="#about">View full experience →</a>
    </div>

    <div class="experience-list">
      {#each experiences as item, index}
        <article class="experience-item">
          <div class="experience-year">{item.year}</div>
          <div class="timeline"><span class:filled={index === 0}></span></div>
          <div>
            <h3>{item.role}</h3>
            <p class="muted">{item.company}</p>
          </div>
          <p class="experience-text">{item.text}</p>
        </article>
      {/each}
    </div>
  </section>

  <section class="section shell" id="projects">
    <div class="section-title-row">
      <p class="section-kicker">SELECTED PROJECTS</p>
      <a href="#projects">View all projects →</a>
    </div>

    <div class="project-grid">
      {#each projects as project}
        <article class="project-card">
          <img src={project.image} alt="" />
          <p class="project-meta">{project.id} / {project.year}</p>
          <h2>{project.title}</h2>
          <p class="project-description">{project.description}</p>
          <div class="detail-row"><span>Role</span><strong>{project.role}</strong></div>
          <div class="detail-row"><span>Tech</span><div>{#each project.tech as tech}<small>{tech}</small>{/each}</div></div>
        </article>
      {/each}
    </div>
  </section>

  <section class="about-summary shell">
    <div>
      <p class="section-kicker">ABOUT</p>
      <h2>I care about software that<br />remains understandable<br />after it grows.</h2>
    </div>
    <div class="about-copy">
      <p>I’m a software engineer who enjoys building systems at the intersection of backend infrastructure, intelligent systems, and connected devices. I value clarity, long-term thinking, and the craft of turning complex problems into simple, maintainable solutions.</p>
      <a href="#about">More about me →</a>
    </div>
  </section>
</main>

<footer class="footer shell">
  <div class="footer-brand"><strong>AM</strong><span>Alex Morgan<br />Software Engineer</span></div>
  <div class="footer-nav">
    {#each nav as item}
      <a href={'#' + item.toLowerCase()}>{item}</a>
    {/each}
  </div>
  <div class="footer-right"><span>◉</span><span>in</span><span>© 2026 Alex Morgan. All rights reserved.</span></div>
</footer>
