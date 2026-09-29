export const nav = [
  ['Home', '/'], ['About', '/about'], ['Projects', '/projects'], ['Blog', '/blog'], ['Certifications', '/certifications'], ['Gallery', '/gallery']
] as const;

const photos = {
  profile: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1400&q=85',
  meeting: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=85',
  iot: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85',
  agent: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=85',
  game: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=85',
  city: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1600&q=85',
  travel: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
  coffee: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1600&q=85',
  workspace: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85'
};

export const profileImage = photos.profile;

export const experiences = [
  { year:'2025 — Present', company:'Northstar Systems', role:'Senior Software Engineer', location:'Jakarta · Hybrid', summary:'Designing and scaling backend systems for global products, with a focus on reliability, performance, and developer experience.', bullets:['Designed and built production-grade services for real-time device communication and control.','Developed event pipelines for high-volume telemetry and background processing.','Implemented retrieval-augmented AI workflows for operational data.','Introduced distributed tracing and structured telemetry across services.'], tech:['Go','PostgreSQL','MQTT','Redis','Docker','OpenTelemetry'] },
  { year:'2024 — 2025', company:'Atlas Labs', role:'Machine Learning Engineer', location:'Remote', summary:'Built and deployed ML-powered features for real-world applications, including LLM workflows and data infrastructure.', bullets:['Developed end-to-end ML pipelines for preparation, training, evaluation, and deployment.','Designed evaluation frameworks for reliability and safety.','Integrated scalable inference services with backend systems.'], tech:['Python','TensorFlow','ML Pipelines','Evaluation','Inference APIs'] },
  { year:'2023 — 2024', company:'Orbit Technologies', role:'Backend Engineer', location:'Jakarta', summary:'Developed and maintained distributed services and APIs for IoT and enterprise platforms.', bullets:['Designed scalable services and event-driven device telemetry.','Improved database performance and service reliability.','Worked on fault-tolerant distributed systems.'], tech:['Go','PostgreSQL','Distributed Systems'] },
  { year:'2022 — 2023', company:'Studio North', role:'Technical SEO Engineer', location:'Remote', summary:'Worked on technical SEO, site performance, crawlability, and content-driven websites.', bullets:['Ran technical audits and infrastructure improvements.','Improved site architecture and structured data.','Monitored analytics and performance metrics.'], tech:['Analytics','Technical SEO','Site Architecture'] }
];

export const certGroups = [
  ['Cloud Computing', [['Google Cloud','Cloud Computing Professional','2025'],['Alibaba Cloud','Cloud Native Developer','2023'],['AWS','AWS Certified Solutions Architect Associate','2023']]],
  ['Software Engineering', [['Dicoding','Backend Engineering Expert','2024'],['Meta','Back-End Developer Professional Certificate','2024']]],
  ['Machine Learning & AI', [['Coursera','Machine Learning Specialization','2024'],['Google','TensorFlow Developer Certificate','2023']]],
  ['Security', [['CompTIA','Security+','2023']]],
  ['Professional Programs', [['Google','Project Management Professional Certificate','2023']]]
] as const;

export const gallery = [
  [photos.city,'Jakarta — 2026'],[photos.workspace,'Workspace'],[photos.travel,'Night Walk'],[photos.iot,'Prototype 04'],[photos.travel,'Somewhere Above'],[photos.city,'Tokyo — 2025'],[photos.profile,'Conference'],[photos.game,'Mount Bromo — 2024'],[photos.coffee,'Good Coffee'],[photos.city,'Bangkok — 2024'],[photos.travel,'Fuji — 2025'],[photos.game,'Nusa Penida — 2024'],[photos.meeting,'Build Session'],[photos.travel,'On to the Next']
];

export const education = [
  ['2020 — 2024','University of Technology','Bachelor of Computer Science','Focused on software engineering, distributed systems, and artificial intelligence. Completed a thesis on scalable backend systems for real-world applications.'],
  ['2017 — 2020','Technical Institute','Electronics & Communications','Built a strong foundation in embedded systems, signal processing, and hardware fundamentals that continues to influence my interest in connected devices.']
];

export const skillGroups = [
  ['Languages','Core programming languages I use regularly.',['Go','Rust','TypeScript','Python','C++']],
  ['Backend','Frameworks and protocols for building scalable services.',['Axum','Actix','Node.js','REST','gRPC']],
  ['Frontend','Libraries and frameworks for modern web applications.',['Svelte','React','Vue','Next.js']],
  ['Data','Databases and data systems for application and AI workloads.',['PostgreSQL','Redis','MySQL','SQLite','Vector Search']],
  ['Infrastructure','Tools for deployment, observability, and reliable operations.',['Docker','Linux','AWS','GCP','CI/CD','OpenTelemetry']],
  ['AI','AI/LLM tooling and frameworks I work with.',['RAG','LLM orchestration','Embeddings','LangGraph','TensorFlow']],
  ['IoT','Technologies for connected devices and real-time systems.',['MQTT','ESP32','Telemetry','Real-time systems']]
];

export const principles = [
  ['01','Build systems that remain understandable.','Clarity compounds. I favor simple, well-structured systems that are easy to reason about, maintain, and evolve.'],
  ['02','Prefer explicit architecture over accidental complexity.','Intentional design leads to more reliable, scalable, and collaborative systems.'],
  ['03','Measure before optimizing.','I rely on data and real-world usage to identify what actually matters before investing in optimization.'],
  ['04','Reliability is part of the product.','Systems should be resilient, observable, and fail gracefully because real users depend on them.'],
  ['05','AI outputs should remain grounded in evidence.','I value factual, traceable, and transparent AI systems that augment human judgment.'],
  ['06','Design around real-world constraints.','Cost, performance, security, and operational complexity all matter in practical systems.']
];

export function getLatestExperiences(limit: number) {
  const score = (value: string) =>
    value.includes('Present')
      ? Number.MAX_SAFE_INTEGER
      : Number(value.match(/\d{4}(?!.*\d{4})/)?.[0] ?? 0);

  return [...experiences]
    .sort((a, b) => score(b.year) - score(a.year))
    .slice(0, limit);
}
