import { About, Blog, Gallery, Home, Newsletter, Person, Social, Work } from "@/types";
import { Line, Row, Text } from "@once-ui-system/core";

const person: Person = {
  firstName: "Faris",
  lastName: "Munir Mahdi",
  name: `Faris Munir Mahdi`,
  role: "Software Engineer",
  avatar: "/images/projects/avatar.jpg",
  email: "farismunir2@gmail.com",
  location: "Asia/Jakarta", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["English", "Bahasa"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter: Newsletter = {
  display: false,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
  description: <>My weekly newsletter about creativity and engineering</>,
};

const social: Social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  // Set essentials: true for links you want to show on the about page
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/farismnrr",
    essential: true,
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/farismnrr",
    essential: true,
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
    essential: true,
  },
];

const home: Home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>Design. <Text as="span" onBackground="brand-medium">Code.</Text> Create.</>,
  featured: {
    display: true,
    title: (
      <Row gap="12" vertical="center">
        <strong className="ml-4">Once UI</strong>{" "}
        <Line background="brand-alpha-strong" vert height="20" />
        <Text marginRight="4" onBackground="brand-medium">
          Featured work
        </Text>
      </Row>
    ),
    href: "/work/building-once-ui-a-customizable-design-system",
  },
  subline: (
    <>
      I'm Faris, a Software Engineer specializing in <Text as="span" size="xl" weight="strong">Backend, Cloud, & IoT</Text>.<br /> Building scalable systems and intelligent solutions.
    </>
  ),
};

const about: About = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: false,
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        I am a Software Engineer specializing in backend architecture, cloud infrastructure, and IoT systems. I focus on engineering scalable, high-performance solutions that integrate intelligent hardware with robust software ecosystems.
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
      {
        company: "DBS Foundation",
        timeframe: "Feb 2025 - Present",
        role: "Machine Learning Engineer",
        achievements: [
          <>
            Engineered and deployed high-performance Machine Learning models using Python and TensorFlow to address complex business challenges.
          </>,
          <>
            Orchestrated end-to-end data processing pipelines and advanced visualization techniques to drive model development and performance optimization.
          </>,
          <>
            Leveraged deep learning methodologies to solve real-world problems, ensuring scalable and accurate predictive analysis.
          </>,
        ],
        images: [],
      },
      {
        company: "Codepolitan",
        timeframe: "Sep 2024 - Dec 2024",
        role: "Full Stack Web Developer",
        achievements: [
          <>
            Architected and maintained robust RESTful APIs using Node.js and Express.js, while managing high-availability MongoDB databases.
          </>,
          <>
            Developed responsive, user-centric frontend interfaces using Vue.js, ensuring seamless cross-device compatibility and user experience.
          </>,
          <>
            Achieved Alibaba Cloud Certification through the KodeBisat collaboration, verifying expertise in scalable cloud infrastructure.
          </>,
        ],
        images: [],
      },
      {
        company: "Ruang Guru Academy",
        timeframe: "Feb 2024 - Aug 2024",
        role: "Back End Developer",
        achievements: [
          <>
            Designed and implemented efficient RESTful APIs using Golang, prioritizing performance and concurrency.
          </>,
          <>
            Integrated advanced machine learning models into backend services to power intelligent application features.
          </>,
          <>
            Optimized PostgreSQL database schemas and queries to handle large-scale data transactions with minimal latency.
          </>,
        ],
        images: [],
      },
      {
        company: "PT Tradeasia International Indonesia",
        timeframe: "Jan 2024 - Apr 2024",
        role: "SEO Specialist",
        achievements: [
          <>
            Executed comprehensive keyword analysis and strategy to significantly improve organic search rankings and visibility.
          </>,
          <>
            Optimized technical site structure and content for chentradeasia.lk and formic-acid.com, implementing targeted backlink strategies.
          </>,
          <>
            Analyzed complex web analytics to identify growth opportunities, resulting in measurable improvements in organic traffic and engagement.
          </>,
        ],
        images: [],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Studies",
    institutions: [
      {
        name: "UPN \"Veteran\" East Java",
        description: (
          <>
            Achieved <Text as="strong">Cumlaude honors</Text> while actively shaping the technical direction of the <Text as="strong">IoTNet</Text> laboratory since the 5th semester. My role involved not just managing infrastructure, but also spearheading complex research initiatives and fostering a collaborative environment for exploring advanced IoT technologies.
          </>
        ),
      },
      {
        name: "SMKN 26 Jakarta",
        description: <>Degree in Power Electronics and Communications</>,
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical skills",
    skills: [
      {
        title: "Languages",
        description: (
          <>Proficient in writing high-performance, memory-safe code for system-level applications and ensuring type safety across the entire stack.</>
        ),
        tags: [
          {
            name: "Go",
            icon: "golang",
          },
          {
            name: "Rust",
            icon: "rust",
          },
          {
            name: "TypeScript",
            icon: "typescript",
          },
          {
            name: "Python",
            icon: "python",
          },
          {
            name: "C++",
            icon: "cplusplus", // Assuming icon name, fallback to generic if not found (will verify icon set later if needed, mostly icons stick to branding)
          },
        ],
        images: [],
      },
      {
        title: "Backend",
        description: (
          <>Architecting scalable microservices and high-throughput RESTful/gRPC APIs, focusing on concurrency and low-latency performance.</>
        ),
        tags: [
          {
            name: "NestJS",
            icon: "nestjs",
          },
          {
            name: "Hapi",
            icon: "hapi",
          },
          {
            name: "Gin",
            icon: "gin",
          },
          {
            name: "Actix",
            icon: "actix",
          },
        ],
        images: [],
      },
      {
        title: "Frontend",
        description: (
          <>Developing modern, responsive web applications with a focus on component reusability, server-side rendering, and optimal user experience.</>
        ),
        tags: [
          {
            name: "Next.js",
            icon: "nextjs",
          },
          {
            name: "Nuxt",
            icon: "nuxt",
          },
          {
            name: "React",
            icon: "react",
          },
          {
            name: "Vue",
            icon: "vue",
          },
        ],
        images: [],
      },
      {
        title: "Database & Storage",
        description: (
          <>Designing optimized database schemas for complex data relationships and implementing high-speed caching strategies for real-time access.</>
        ),
        tags: [
          {
            name: "PostgreSQL",
            icon: "postgresql",
          },
          {
            name: "MySQL",
            icon: "mysql",
          },
          {
            name: "Redis",
            icon: "redis",
          },
          {
            name: "RocksDB",
            icon: "rocksdb",
          },
          {
            name: "SQLite",
            icon: "sqlite",
          },
        ],
        images: [],
      },
      {
        title: "DevOps & Infrastructure",
        description: (
          <>Automating deployment workflows with CI/CD pipelines and managing containerized infrastructure on cloud platforms for high availability.</>
        ),
        tags: [
          {
            name: "Docker",
            icon: "docker",
          },
          {
            name: "AWS",
            icon: "aws",
          },
          {
            name: "GitHub Actions",
            icon: "githubactions",
          },
          {
            name: "GCP",
            icon: "googlecloud",
          },
          {
            name: "Linux",
            icon: "linux",
          },
        ],
        images: [],
      },
      {
        title: "IoT & Embedded",
        description: (
          <>Engineering secure, real-time communication between hardware and cloud systems, including firmware development and Over-The-Air (OTA) updates.</>
        ),
        tags: [
          {
            name: "Arduino",
            icon: "arduino",
          },
          {
            name: "ESP32",
            icon: "esp32",
          },
          {
            name: "EMQX",
            icon: "emqx",
          },
          {
            name: "Grafana",
            icon: "grafana",
          },
          {
            name: "Node-RED",
            icon: "nodered",
          },
        ],
        images: [],
      },
    ],
  },
};

const blog: Blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing about design and tech...",
  description: `Read what ${person.name} has been up to recently`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work: Work = {
  path: "/work",
  label: "Work",
  title: `Projects – ${person.name}`,
  description: `Design and dev projects by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const certifications = {
  path: "/certifications",
  label: "Certifications",
  title: "Certifications & Achievements",
  description: "Professional certifications and achievements",
};

const gallery: Gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
};

export { person, social, newsletter, home, about, blog, work, gallery, certifications };
