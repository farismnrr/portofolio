<script lang="ts">
  import type { NavigationItem } from '../structured-content';
  import { navigation } from '../structured-content';
  import { navigate } from '../router';
  import { prefetchRoute } from '../routes';
  import AppIcon from './AppIcon.svelte';

  export let currentPath = '/';

  const iconByHref: Record<string, 'home' | 'about' | 'projects' | 'blog' | 'certifications' | 'gallery'> = {
    '/': 'home',
    '/about': 'about',
    '/projects': 'projects',
    '/blog': 'blog',
    '/certifications': 'certifications',
    '/gallery': 'gallery'
  };

  function iconFor(item: NavigationItem) {
    return iconByHref[item.href] ?? 'home';
  }
</script>

<nav class="fixed inset-x-0 bottom-0 z-50 border-t border-black/10 bg-[#f8f8f6]/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 backdrop-blur-md lg:hidden" aria-label="Mobile navigation">
  <div class="mx-auto grid max-w-[640px] grid-cols-6 px-2">
    {#each navigation as item}
      <a
        href={item.href}
        on:mouseenter={() => prefetchRoute(item.href)}
        on:focus={() => prefetchRoute(item.href)}
        on:click={(event) => navigate(event, item.href)}
        aria-current={currentPath === item.href ? 'page' : undefined}
        class="relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 py-1.5 text-[9px] font-medium leading-none text-black/46 transition hover:bg-black/[0.035] hover:text-black"
        class:text-black={currentPath === item.href}
      >
        <span class={"flex h-7 w-7 items-center justify-center rounded-full transition " + (currentPath === item.href ? "bg-[#e3e8df] text-[#334633]" : "")}>
          <AppIcon name={iconFor(item)} size={18} strokeWidth={1.7}/>
        </span>
        <span class="w-full truncate text-center">{item.label}</span>
        {#if currentPath === item.href}
          <span class="absolute -top-[9px] h-[2px] w-7 bg-[#3f563f]"></span>
        {/if}
      </a>
    {/each}
  </div>
</nav>
