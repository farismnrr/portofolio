import { articles, getArticleByPath } from './blog-content';
import { getProjectByPath, projects } from './project-content';
import { profile } from './structured-content';

const siteUrl = 'https://farismnrr.com';
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
    return {
      ...base,
      title: `About — ${profile.name}`,
      description: profile.intro || defaultDescription,
      structuredData: graph({
        '@type': 'ProfilePage',
        '@id': `${canonical}#profile-page`,
        url: canonical,
        name: `About ${profile.name}`,
        description: profile.intro || defaultDescription,
        mainEntity: { '@id': `${siteUrl}/#person` },
        inLanguage: 'en'
      }, breadcrumb([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }]))
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
        about: { '@id': `${siteUrl}/#person` },
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
        about: { '@id': `${siteUrl}/#person` },
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
      const externalLinks = [project.productUrl, project.repoUrl].filter(Boolean);
      const projectNode: Record<string, unknown> = {
        '@type': project.repoUrl ? 'SoftwareSourceCode' : 'CreativeWork',
        '@id': `${canonical}#project`,
        url: canonical,
        name: project.title,
        headline: project.subtitle,
        description: project.description,
        image: absoluteUrl(project.image),
        author: { '@id': `${siteUrl}/#person` },
        keywords: project.tech.join(', '),
        about: project.category,
        inLanguage: 'en'
      };
      if (project.repoUrl) projectNode.codeRepository = project.repoUrl;
      if (externalLinks.length) projectNode.sameAs = externalLinks;

      return {
        ...base,
        title: `${project.title} — ${profile.name}`,
        description: project.description,
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
      return {
        ...base,
        title: `${article.title} — ${profile.name}`,
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
          author: { '@id': `${siteUrl}/#person` },
          publisher: { '@id': `${siteUrl}/#person` },
          articleSection: article.category,
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
        '@type': 'WebPage',
        '@id': `${canonical}#webpage`,
        url: canonical,
        name: `Certifications — ${profile.name}`,
        about: { '@id': `${siteUrl}/#person` },
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
        about: { '@id': `${siteUrl}/#person` },
        inLanguage: 'en'
      }, breadcrumb([{ name: 'Home', path: '/' }, { name: 'Gallery', path: '/gallery' }]))
    };
  }

  return { ...base, canonical: `${siteUrl}/` };
}
