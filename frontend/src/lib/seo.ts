import { articles, getArticleByPath } from './blog-content';
import { getProjectByPath, projects } from './project-content';
import { certifications, profile, publications } from './structured-content';

const siteUrl = 'https://farismnrr.com';
const personId = `${siteUrl}/#person`;
const defaultDescription =
  'Portfolio of Faris Munir Mahdi, a Software Engineer focused on backend architecture, cloud infrastructure, IoT systems, and practical AI engineering.';

function absoluteUrl(value: string) {
  if (!value) return `${siteUrl}${profile.image}`;
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
}

function breadcrumb(items: Array<{ name: string; path: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`
    }))
  };
}

function graph(...nodes: Record<string, unknown>[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}

function personNode() {
  return {
    '@type': 'Person',
    '@id': personId,
    name: profile.name,
    url: `${siteUrl}/`,
    image: absoluteUrl(profile.image),
    jobTitle: profile.role,
    sameAs: [profile.github, profile.linkedin, profile.googleCloudSkills].filter(Boolean),
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'UPN Veteran Jawa Timur',
      sameAs: 'https://www.upnjatim.ac.id/'
    },
    knowsAbout: [
      'Software Engineering',
      'Backend Engineering',
      'Cloud Infrastructure',
      'Internet of Things',
      'Artificial Intelligence'
    ]
  };
}

function publicationNode(publication: (typeof publications)[number], index: number) {
  const node: Record<string, unknown> = {
    '@type': publication.type === 'journal' ? 'ScholarlyArticle' : 'CreativeWork',
    '@id': `${siteUrl}/about#publication-${index + 1}`,
    name: publication.title,
    headline: publication.title,
    description: publication.summary,
    url: publication.url,
    datePublished: publication.year,
    author: { '@id': personId },
    publisher: publication.venue,
    inLanguage: publication.type === 'journal' ? 'id' : 'id'
  };
  if (publication.doi) node.sameAs = [publication.doi];
  return node;
}

export function getSeo(currentPath: string) {
  const cleanPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');
  const canonical = `${siteUrl}${cleanPath}`;
  const base = {
    title: `${profile.name} — ${profile.role}`,
    description: defaultDescription,
    canonical,
    image: `${siteUrl}/og-image.png`,
    imageAlt: `${profile.name} — ${profile.role}`,
    ogType: 'website',
    published: '',
    structuredData: null as Record<string, unknown> | null
  };

  if (cleanPath === '/about') {
    const publicationNodes = publications.map(publicationNode);
    const aboutDescription =
      'Software Engineer Faris Munir Mahdi builds backend, cloud, IoT, and practical AI systems, with public projects, research, and professional experience.';
    return {
      ...base,
      title: `About — ${profile.name}`,
      description: aboutDescription,
      structuredData: graph(
        personNode(),
        {
          '@type': 'ProfilePage',
          '@id': `${canonical}#profile-page`,
          url: canonical,
          name: `About ${profile.name}`,
          description: aboutDescription,
          mainEntity: { '@id': personId },
          hasPart: publicationNodes.map((node) => ({ '@id': node['@id'] })),
          inLanguage: 'en'
        },
        ...publicationNodes,
        breadcrumb([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])
      )
    };
  }

  if (cleanPath === '/experience') {
    return {
      ...base,
      title: `Experience — ${profile.name}`,
      description: `Professional software engineering experience of ${profile.name}, covering backend systems, cloud infrastructure, IoT, and applied AI.`,
      structuredData: graph({
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: `Experience — ${profile.name}`,
        description: `Professional software engineering experience of ${profile.name}.`,
        about: { '@id': personId },
        inLanguage: 'en'
      }, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Experience', path: '/experience' }]))
    };
  }

  if (cleanPath === '/skills') {
    return {
      ...base,
      title: `Skills — ${profile.name}`,
      description: 'Engineering skills across backend architecture, cloud infrastructure, IoT, software delivery, and practical AI systems.',
      structuredData: graph({
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: `Skills — ${profile.name}`,
        about: { '@id': personId },
        inLanguage: 'en'
      }, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Skills', path: '/skills' }]))
    };
  }

  if (cleanPath === '/projects') {
    return {
      ...base,
      title: `Software Engineering Projects — ${profile.name}`,
      description: `Selected software engineering case studies by ${profile.name}, spanning backend systems, cloud infrastructure, IoT platforms, and AI engineering.`,
      structuredData: graph({
        '@type': 'CollectionPage',
        '@id': `${canonical}#collection`,
        url: canonical,
        name: `Software Engineering Projects — ${profile.name}`,
        description: `Selected software engineering case studies by ${profile.name}.`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: projects.map((project, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: project.title,
            url: `${siteUrl}/projects/${project.slug}`
          }))
        },
        inLanguage: 'en'
      }, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Projects', path: '/projects' }]))
    };
  }

  if (cleanPath.startsWith('/projects/')) {
    const project = getProjectByPath(cleanPath);
    if (project) {
      const projectNode: Record<string, unknown> = {
        '@type': project.repoUrl ? 'SoftwareSourceCode' : 'CreativeWork',
        '@id': `${canonical}#project`,
        url: canonical,
        mainEntityOfPage: canonical,
        name: project.title,
        headline: project.subtitle,
        description: project.description,
        image: absoluteUrl(project.image),
        author: { '@id': personId },
        keywords: project.tech.join(', '),
        about: project.category,
        inLanguage: 'en'
      };
      if (project.repoUrl) projectNode.codeRepository = project.repoUrl;
      if (project.productUrl) projectNode.workExample = project.productUrl;

      const metaDescription = project.slug === 'sensio-iot'
        ? 'An on-premises smart-space platform organizing users, rooms, device state, telemetry, and hardware control around the physical spaces people manage.'
        : project.description;

      return {
        ...base,
        title: `${project.title} — ${profile.name}`,
        description: metaDescription,
        image: absoluteUrl(project.image),
        imageAlt: `${project.title} project by ${profile.name}`,
        structuredData: graph(projectNode, breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Projects', path: '/projects' },
          { name: project.title, path: cleanPath }
        ]))
      };
    }
  }

  if (cleanPath === '/blog') {
    return {
      ...base,
      title: `Engineering Blog — ${profile.name}`,
      description: `Technical writing by ${profile.name} about software engineering, backend systems, cloud infrastructure, IoT, and applied AI.`,
      structuredData: graph({
        '@type': 'CollectionPage',
        '@id': `${canonical}#collection`,
        url: canonical,
        name: `Engineering Blog — ${profile.name}`,
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: articles.map((article, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: article.title,
            url: `${siteUrl}/blog/${article.slug}`
          }))
        },
        inLanguage: 'en'
      }, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }]))
    };
  }

  if (cleanPath.startsWith('/blog/')) {
    const article = getArticleByPath(cleanPath);
    if (article) {
      const metaTitle = article.slug === 'building-iotnet'
        ? `Building IoTNet: Real-World IoT Lessons — ${profile.name}`
        : `${article.title} — ${profile.name}`;
      return {
        ...base,
        title: metaTitle,
        description: article.excerpt,
        image: absoluteUrl(article.cover),
        imageAlt: `${article.title} cover image`,
        ogType: 'article',
        published: article.published,
        structuredData: graph({
          '@type': 'BlogPosting',
          '@id': `${canonical}#article`,
          mainEntityOfPage: canonical,
          url: canonical,
          headline: article.title,
          description: article.excerpt,
          image: absoluteUrl(article.cover),
          datePublished: article.published,
          author: {
            '@type': 'Person',
            '@id': personId,
            name: profile.name,
            url: `${siteUrl}/about`
          },
          publisher: { '@id': personId },
          articleSection: article.category,
          isAccessibleForFree: true,
          inLanguage: 'en'
        }, breadcrumb([
          { name: 'Home', path: '/' },
          { name: 'Blog', path: '/blog' },
          { name: article.title, path: cleanPath }
        ]))
      };
    }
  }

  if (cleanPath === '/certifications') {
    return {
      ...base,
      title: `Certifications — ${profile.name}`,
      description: `Technical certifications and professional learning completed by ${profile.name}.`,
      structuredData: graph({
        '@type': 'CollectionPage',
        '@id': `${canonical}#collection`,
        url: canonical,
        name: `Certifications — ${profile.name}`,
        about: { '@id': personId },
        mainEntity: {
          '@type': 'ItemList',
          itemListElement: certifications.map((certification, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            item: {
              '@type': 'EducationalOccupationalCredential',
              name: certification.title,
              url: certification.url || canonical,
              recognizedBy: certification.issuer ? { '@type': 'Organization', name: certification.issuer } : undefined,
              identifier: certification.credentialId || undefined,
              dateCreated: certification.year || undefined
            }
          }))
        },
        inLanguage: 'en'
      }, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Certifications', path: '/certifications' }]))
    };
  }

  if (cleanPath === '/gallery') {
    return {
      ...base,
      title: `Gallery — ${profile.name}`,
      description: `Project, engineering, and professional gallery from ${profile.name}.`,
      structuredData: graph({
        '@type': 'CollectionPage',
        '@id': `${canonical}#collection`,
        url: canonical,
        name: `Gallery — ${profile.name}`,
        about: { '@id': personId },
        inLanguage: 'en'
      }, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Gallery', path: '/gallery' }]))
    };
  }

  return { ...base, canonical: `${siteUrl}/` };
}
