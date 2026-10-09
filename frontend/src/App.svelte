<script lang="ts">
  import { onMount } from 'svelte';
  import { path } from './lib/router';
  import { loadRoute } from './lib/routes';
  import { profile, resolveActiveNavigation } from './lib/structured-content';
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

  function getSeo(currentPath: string) {
    const cleanPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');
    const canonical = `${siteUrl}${cleanPath}`;

    if (cleanPath === '/about') {
      return { title: `About — ${profile.name}`, description: profile.intro || defaultDescription, canonical };
    }
    if (cleanPath === '/experience') {
      return { title: `Experience — ${profile.name}`, description: `Professional software engineering experience of ${profile.name}.`, canonical };
    }
    if (cleanPath === '/skills') {
      return { title: `Skills — ${profile.name}`, description: `Engineering skills across backend, cloud, IoT, infrastructure, and AI.`, canonical };
    }
    if (cleanPath === '/projects') {
      return { title: `Projects — ${profile.name}`, description: `Selected software engineering projects spanning backend systems, cloud, IoT, and AI.`, canonical };
    }
    if (cleanPath.startsWith('/projects/')) {
      const slug = cleanPath.split('/').filter(Boolean).at(-1)?.replace(/-/g, ' ') ?? 'Project';
      return { title: `${slug.replace(/\b\w/g, (c) => c.toUpperCase())} — ${profile.name}`, description: `Project case study by ${profile.name}.`, canonical };
    }
    if (cleanPath === '/blog') {
      return { title: `Blog — ${profile.name}`, description: `Technical writing by ${profile.name} about software engineering and systems.`, canonical };
    }
    if (cleanPath.startsWith('/blog/')) {
      const slug = cleanPath.split('/').filter(Boolean).at(-1)?.replace(/-/g, ' ') ?? 'Article';
      return { title: `${slug.replace(/\b\w/g, (c) => c.toUpperCase())} — ${profile.name}`, description: `Technical article by ${profile.name}.`, canonical };
    }
    if (cleanPath === '/certifications') {
      return { title: `Certifications — ${profile.name}`, description: `Technical certifications earned by ${profile.name}.`, canonical };
    }
    if (cleanPath === '/gallery') {
      return { title: `Gallery — ${profile.name}`, description: `Project and engineering gallery from ${profile.name}.`, canonical };
    }

    return { title: `${profile.name} — ${profile.role}`, description: defaultDescription, canonical: `${siteUrl}/` };
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

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={profile.name} />
  <meta property="og:title" content={seo.title} />
  <meta property="og:description" content={seo.description} />
  <meta property="og:url" content={seo.canonical} />
  <meta property="og:image" content={`${siteUrl}${profile.image}`} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={seo.title} />
  <meta name="twitter:description" content={seo.description} />
  <meta name="twitter:image" content={`${siteUrl}${profile.image}`} />
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
