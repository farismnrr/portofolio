export const nav = [
  ['Home', '/'], ['About', '/about'], ['Projects', '/projects'], ['Blog', '/blog'], ['Certifications', '/certifications'], ['Gallery', '/gallery']
] as const;

export const experiences = [
  { year:'2025 — Present', company:'Northstar Systems', role:'Senior Software Engineer', location:'Jakarta · Hybrid', summary:'Designing and scaling backend systems for global products with a focus on reliability, performance, and developer experience.', bullets:['Designed production-grade services for real-time device communication and control.','Built MQTT event pipelines and resilient background processing.','Implemented grounded AI workflows connected to operational data.','Introduced distributed tracing and structured telemetry.'], tech:['Go','PostgreSQL','MQTT','Redis','Docker','OpenTelemetry'] },
  { year:'2024 — 2025', company:'Atlas Labs', role:'Machine Learning Engineer', location:'Remote', summary:'Built and deployed machine-learning features for real-world applications and production workflows.', bullets:['Developed end-to-end ML pipelines for training and evaluation.','Designed model evaluation loops for reliability and safety.','Deployed inference services and integrated them with backend systems.'], tech:['Python','TensorFlow','ML Pipelines','Evaluation','Inference APIs'] },
  { year:'2023 — 2024', company:'Orbit Technologies', role:'Backend Engineer', location:'Jakarta', summary:'Developed distributed backend services for IoT and enterprise systems.', bullets:['Designed scalable microservices and event-driven device telemetry.','Improved database queries and service reliability.','Worked on distributed systems with fault tolerance in mind.'], tech:['Go','PostgreSQL','Distributed Systems'] },
  { year:'2022 — 2023', company:'Studio North', role:'Technical SEO Engineer', location:'Remote', summary:'Worked on technical SEO, site performance, crawlability, and content-driven websites.', bullets:['Ran technical audits and infrastructure improvements.','Improved site architecture and structured data.','Monitored analytics and performance metrics.'], tech:['Analytics','Technical SEO','Site Architecture'] }
];

export const projects = [
  { id:'01', year:'2025', title:'Sensio Notes', subtitle:'Meeting Intelligence Platform', image:'/images/project-meeting.svg', role:'Lead Engineer', category:'AI · Productivity', tech:['Python','FastAPI','OpenAI','PostgreSQL','Svelte','Redis'], description:'AI-powered meeting transcription, summarization, and action-item tracking for modern teams.' },
  { id:'02', year:'2024', title:'Sensio IoT', subtitle:'Smart-space control platform', image:'/images/project-iot.svg', role:'Full Stack Engineer', category:'IoT · Infrastructure', tech:['Python','MQTT','AWS','InfluxDB','Svelte'], description:'End-to-end platform for connected spaces, from device firmware to cloud infrastructure and dashboards.' },
  { id:'03', year:'2024', title:'Agentic Workspace', subtitle:'Autonomous coding environment', image:'/images/project-agent.svg', role:'Core Developer', category:'Developer Tools · AI', tech:['TypeScript','Node.js','LangChain','PostgreSQL','Svelte'], description:'An AI-native development environment with autonomous agents for code generation, testing, and project understanding.' },
  { id:'04', year:'2023', title:'Learning Worlds', subtitle:'Game-based education platform', image:'/images/project-game.svg', role:'Software Engineer', category:'EdTech · Gaming', tech:['Svelte','Python','PostgreSQL','WebRTC','Three.js'], description:'Interactive learning using game mechanics to teach programming and problem-solving.' },
  { id:'05', year:'2023', title:'Tenant Core', subtitle:'Multi-tenant identity service', image:'/images/project-meeting.svg', role:'Backend Engineer', category:'Infrastructure · Security', tech:['Go','PostgreSQL','Redis','Kubernetes'], description:'Scalable identity and access management with fine-grained permissions.' },
  { id:'06', year:'2024', title:'Observability Stack', subtitle:'Infrastructure monitoring platform', image:'/images/project-agent.svg', role:'Backend Engineer', category:'Developer Tools · DevOps', tech:['Go','Prometheus','Grafana','ClickHouse'], description:'Distributed tracing, metrics, and logging for cloud-native services.' }
];

export const articles = [
  ['SEP 2026','Engineering','12 min read','Designing Reliable Event-Driven Systems','Patterns, trade-offs, and practical lessons from building event-driven systems at scale.'],
  ['AUG 2026','AI','10 min read','Building AI Features That Stay Grounded','How to design reliable AI features with context, guardrails, and evaluation loops.'],
  ['JUL 2026','Architecture','11 min read','Lessons from a Multi-Tenant Architecture','Key design decisions and what I would do differently after building a multi-tenant platform.'],
  ['MAY 2026','IoT','9 min read','Running IoT Systems in the Real World','Practical lessons from deploying and operating connected devices at scale.'],
  ['APR 2026','Backend','8 min read','Why Background Jobs Fail','Common failure modes and patterns for resilient background processing.'],
  ['MAR 2026','Observability','10 min read','Observability Beyond Logging','Moving from logs to metrics, tracing, and structured context.']
];

export const certGroups = [
  ['Cloud Computing', [['Google Cloud','Cloud Computing Professional','2025'],['Alibaba Cloud','Cloud Native Developer','2023'],['AWS','Solutions Architect Associate','2023']]],
  ['Software Engineering', [['Dicoding','Backend Engineering Expert','2024'],['Meta','Back-End Developer Professional Certificate','2024']]],
  ['Machine Learning & AI', [['Coursera','Machine Learning Specialization','2024'],['Google','TensorFlow Developer Certificate','2023']]],
  ['Security', [['CompTIA','Security+','2023']]],
  ['Professional Programs', [['Google','Project Management Professional Certificate','2023']]]
] as const;

export const gallery = [
  ['/images/project-game.svg','Jakarta — 2026'],['/images/project-meeting.svg','Workspace'],['/images/project-agent.svg','Night Walk'],['/images/project-iot.svg','Prototype 04'],['/images/project-game.svg','Somewhere Above'],['/images/project-meeting.svg','Tokyo — 2025'],['/images/profile.svg','Conference'],['/images/project-game.svg','Mount Bromo — 2024'],['/images/project-meeting.svg','Good Coffee'],['/images/project-agent.svg','Bangkok — 2024'],['/images/project-game.svg','Fuji — 2025'],['/images/project-iot.svg','Nusa Penida — 2024'],['/images/project-meeting.svg','Build Session'],['/images/project-game.svg','On to the Next']
];

export const education = [
  ['2020 — 2024','University of Technology','Bachelor of Computer Science','Graduated with honors. Focused on software engineering, distributed systems, and artificial intelligence.'],
  ['2017 — 2020','Technical Institute','Electronics & Communications','Built a foundation in embedded systems, signal processing, and hardware fundamentals.']
];

export const skillGroups = [
  ['Languages','Core programming languages I use regularly.',['Go','Rust','TypeScript','Python','C++']],
  ['Backend','Frameworks and protocols for scalable services.',['Axum','Actix','Node.js','REST','gRPC']],
  ['Frontend','Libraries and frameworks for modern web applications.',['Svelte','React','Vue','Next.js']],
  ['Data','Databases and data systems for application and AI workloads.',['PostgreSQL','Redis','MySQL','SQLite','Vector Search']],
  ['Infrastructure','Tools for deployment, observability, and reliable operations.',['Docker','Linux','AWS','GCP','CI/CD','OpenTelemetry']],
  ['AI','AI/LLM tooling and frameworks I work with.',['RAG','LLM orchestration','Embeddings','LangGraph','TensorFlow']],
  ['IoT','Technologies for connected devices and real-time systems.',['MQTT','ESP32','Telemetry','Real-time systems']]
];

export const principles = [
  ['01','Build systems that remain understandable.','Clarity compounds. I favor simple, well-structured systems that are easy to reason about, maintain, and evolve.'],
  ['02','Prefer explicit architecture over accidental complexity.','Intentional design leads to more reliable, scalable, and collaborative systems.'],
  ['03','Measure before optimizing.','I rely on data and real-world usage before investing in optimization.'],
  ['04','Reliability is part of the product.','Systems should be resilient, observable, and fail gracefully.'],
  ['05','AI outputs should remain grounded in evidence.','I value factual, traceable, and transparent AI systems that augment human judgment.'],
  ['06','Design around real-world constraints.','Cost, performance, security, and operational complexity all matter.']
];
