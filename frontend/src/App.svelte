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

  onMount(() => initializeTheme());

  $: current = $path;
  $: active = resolveActiveNavigation(current);
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

<svelte:head><title>{profile.name} — {profile.role}</title></svelte:head>
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
