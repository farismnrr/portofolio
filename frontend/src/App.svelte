<script lang="ts">
  import { onMount } from 'svelte';
  import { path } from './lib/router';
  import { loadRoute } from './lib/routes';
  import { profile, resolveActiveNavigation } from './lib/structured-content';
  import { getProjectByPath, projects } from './lib/project-content';
  import { articles, getArticleByPath } from './lib/blog-content';
  import SiteHeader from './lib/ui/SiteHeader.svelte';
  import SiteFooter from './lib/ui/SiteFooter.svelte';
  import RouteLoading from './lib/ui/RouteLoading.svelte';
  import MobileNavigation from './lib/ui/MobileNavigation.svelte';
  import { initializeTheme } from './lib/theme';

  let Page: any = null;
  let loading = true;
  let requestId = 0;

  const siteUrl = 'https://farismnrr.com';
  const defaultDescription =
    'Portfolio of Faris Munir Mahdi, a Software Engineer focused on backend architecture, cloud infrastructure, IoT systems, and practical AI engineering.';

  onMount(() => initializeTheme());

  $: current = $path;
  $: active = resolveActiveNavigation(current);
  $: seo = getSeo(current);
  $: void resolvePage(current);

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

  function getSeo(currentPath: string) {
    const cleanPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');
    const canonical = `${siteUrl}${cleanPath}`;
    const base = {
      title: `${profile.name} — ${profile.role}`,
      description: defaultDescription,
      canonical,
      image: absoluteUrl(profile.image),
      imageAlt: `${profile.name}, ${profile.role}`,
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
        description: `Engineering skills across backend architecture, cloud infrastructure, IoT, software delivery, and practical AI systems.`,
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

  async function resolvePage(currentPath: string) {
    const id = ++requestId;
    loading = true;
    const module = await loadRoute(currentPath);
    if (id !== requestId) return;
    Page = module.default;
    loading = false;
  }
</script>

<svelte:head>
  <title>{seo.title}</title>
  <meta name="description" content={seo.description} />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
  <link rel="canonical" href={seo.canonical} />

  <meta property="og:type" content={seo.ogType} />
  <meta property="og:locale" content="en_US" />
  <meta property="og:site_name" content={profile.name} />
  <meta property="og:title" content={seo.title} />
  <meta property="og:description" content={seo.description} />
  <meta property="og:url" content={seo.canonical} />
  <meta property="og:image" content={seo.image} />
  <meta property="og:image:secure_url" content={seo.image} />
  <meta property="og:image:alt" content={seo.imageAlt} />
  {#if seo.published}<meta property="article:published_time" content={seo.published} />{/if}

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:domain" content="farismnrr.com" />
  <meta name="twitter:url" content={seo.canonical} />
  <meta name="twitter:title" content={seo.title} />
  <meta name="twitter:description" content={seo.description} />
  <meta name="twitter:image" content={seo.image} />
  <meta name="twitter:image:alt" content={seo.imageAlt} />

  {#if seo.structuredData}
    <script type="application/ld+json">{JSON.stringify(seo.structuredData)}</script>
  {/if}
</svelte:head>

<SiteHeader currentPath={active}/>
<div class="pb-[76px] lg:pb-0">
  {#if loading || !Page}
    <RouteLoading/>
  {:else}
    <svelte:component this={Page}/>
  {/if}
  <SiteFooter/>
</div>
<MobileNavigation currentPath={active}/>
