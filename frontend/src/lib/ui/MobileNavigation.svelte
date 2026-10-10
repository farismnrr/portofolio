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

  function mobileLabel(item: NavigationItem) {
    return item.href === '/certifications' ? 'Certs' : item.label;
  }
</script>

<nav class="fixed inset-x-0 bottom-0 z-50 border-t border-black/14 bg-[var(--page-bg)]/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 backdrop-blur-md lg:hidden" aria-label="Mobile navigation">
  <div class="mx-auto grid w-full max-w-[640px] grid-cols-6 px-1 sm:px-2">
    {#each navigation as item}
      <a
        href={item.href}
        on:pointerdown={() => prefetchRoute(item.href)}
        on:mouseenter={() => prefetchRoute(item.href)}
        on:focus={() => prefetchRoute(item.href)}
        on:click={(event) => navigate(event, item.href)}
        aria-label={item.label}
        aria-current={currentPath === item.href ? 'page' : undefined}
        class="relative flex min-h-[60px] min-w-0 flex-col items-center justify-center gap-1 px-0.5 py-1.5 text-[9px] font-medium leading-none text-black/62 transition hover:text-black min-[390px]:text-[10px]"
        class:text-black={currentPath === item.href}
      >
        <span class="flex h-7 w-7 items-center justify-center">
          <AppIcon name={iconFor(item)} size={18} strokeWidth={1.7}/>
        </span>
        <span class="w-full truncate text-center">{mobileLabel(item)}</span>
        {#if currentPath === item.href}
          <span class="absolute inset-x-2 -top-[7px] h-[2px] bg-[var(--accent)] sm:inset-x-3"></span>
        {/if}
      </a>
    {/each}
  </div>
</nav>
