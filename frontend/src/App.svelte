<script lang="ts">
  import { path } from './lib/router';
  import { loadRoute } from './lib/routes';
  import SiteHeader from './lib/ui/SiteHeader.svelte';
  import SiteFooter from './lib/ui/SiteFooter.svelte';
  import RouteLoading from './lib/ui/RouteLoading.svelte';

  let Page: any = null;
  let loading = true;
  let requestId = 0;

  $: current = $path;
  $: active = current.startsWith('/projects') ? '/projects'
    : current.startsWith('/blog') ? '/blog'
    : current.startsWith('/certifications') ? '/certifications'
    : current.startsWith('/gallery') ? '/gallery'
    : current.startsWith('/about') || current.startsWith('/experience') || current.startsWith('/skills') ? '/about'
    : '/';

  $: void resolvePage(current);

  async function resolvePage(currentPath: string) {
    const id = ++requestId;
    loading = true;
    const module = await loadRoute(currentPath);
    if (id !== requestId) return;
    Page = module.default;
    loading = false;
  }
</script>

<svelte:head><title>Alex Morgan — Software Engineer</title></svelte:head>
<SiteHeader currentPath={active}/>
{#if loading || !Page}
  <RouteLoading/>
{:else}
  <svelte:component this={Page}/>
{/if}
<SiteFooter/>
