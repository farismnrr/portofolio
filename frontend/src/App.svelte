<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { path, scrollToCurrentHash } from './lib/router';
  import { loadRoute } from './lib/routes';
  import { getSeo } from './lib/seo';
  import { profile, resolveActiveNavigation } from './lib/site-content';
  import SiteHeader from './lib/ui/SiteHeader.svelte';
  import SiteFooter from './lib/ui/SiteFooter.svelte';
  import RouteLoading from './lib/ui/RouteLoading.svelte';
  import MobileNavigation from './lib/ui/MobileNavigation.svelte';
  import { initializeTheme } from './lib/theme';

  export let initialPage: any = null;
  export let initialPath = '';

  let Page: any = initialPage;
  let resolvedPath = initialPage ? initialPath : '';
  let loading = !Page;
  let requestId = 0;

  onMount(() => {
    initializeTheme();
    scrollToCurrentHash();
  });

  $: current = $path;
  $: active = resolveActiveNavigation(current);
  $: seo = getSeo(current);
  $: structuredDataScript = seo.structuredData
    ? `<script type="application/ld+json">${JSON.stringify(seo.structuredData).replace(/</g, '\\u003c')}<\/script>`
    : '';
  $: if (current !== resolvedPath) void resolvePage(current);

  async function resolvePage(currentPath: string) {
    const id = ++requestId;
    loading = true;
    const module = await loadRoute(currentPath);
    if (id !== requestId) return;
    Page = module.default;
    resolvedPath = currentPath;
    loading = false;
    await tick();
    if (id === requestId) scrollToCurrentHash();
  }
</script>

<svelte:head>
  <title>{seo.title}</title>
  <meta name="description" content={seo.description} />
  <meta name="robots" content={seo.robots} />
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
  {@html structuredDataScript}
</svelte:head>

<a class="skip-link" href="#main-content">Skip to content</a>
<SiteHeader currentPath={active}/>
<div id="main-content" tabindex="-1" class="pb-[calc(68px+max(env(safe-area-inset-bottom),0.5rem))] lg:pb-0">
  {#if loading || !Page}
    <RouteLoading/>
  {:else}
    <svelte:component this={Page}/>
  {/if}
  <SiteFooter/>
</div>
<MobileNavigation currentPath={active}/>
