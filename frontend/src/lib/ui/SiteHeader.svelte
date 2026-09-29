<script lang="ts">
  import AppIcon from './AppIcon.svelte';
  import BrandLogo from './BrandLogo.svelte';
  import { navigation, profile } from '../structured-content';
  import { navigate } from '../router';
  import { prefetchRoute } from '../routes';
  import { theme, toggleTheme } from '../theme';
  import PageShell from './PageShell.svelte';
  export let currentPath = '/';
</script>

<header class="sticky top-0 z-50 border-b border-black/10 bg-[var(--page-bg)]/95 backdrop-blur-md">
  <PageShell>
    <div class="flex h-[74px] items-center justify-between">
      <a href="/" aria-label="Faris Munir home" on:mouseenter={()=>prefetchRoute('/')} on:focus={()=>prefetchRoute('/')} on:click={(e)=>navigate(e,'/')} class="block h-[24px] w-[126px]">
        <BrandLogo className="h-full w-full"/>
      </a>
      <nav class="hidden h-full items-center lg:flex">
        {#each navigation as item}
          <a href={item.href} on:mouseenter={()=>prefetchRoute(item.href)} on:focus={()=>prefetchRoute(item.href)} on:click={(e)=>navigate(e,item.href)} class="relative flex h-full items-center px-[18px] text-[13px] text-black/65 transition hover:text-black" class:text-black={currentPath===item.href}>
            {item.label}
            {#if currentPath===item.href}<span class="absolute inset-x-[14px] bottom-0 h-px bg-black"></span>{/if}
          </a>
        {/each}
      </nav>
      <div class="flex items-center gap-1">
        <a class="btn btn-circle btn-ghost btn-sm" aria-label="GitHub" href={profile.github}><AppIcon name="github" size={19}/></a>
        <a class="btn btn-circle btn-ghost btn-sm" aria-label="LinkedIn" href={profile.linkedin}><AppIcon name="linkedin" size={19}/></a>
        <span class="mx-2 hidden h-6 w-px bg-black/12 sm:block"></span>
        <button
          class="btn btn-circle btn-ghost btn-sm"
          aria-label={"Switch to " + ($theme === 'dark' ? 'light' : 'dark') + " mode"}
          title={"Switch to " + ($theme === 'dark' ? 'light' : 'dark') + " mode"}
          on:click={() => toggleTheme($theme)}
        >
          <AppIcon name={$theme === 'dark' ? 'sun' : 'moon'} size={19}/>
        </button>
      </div>
    </div>
  </PageShell>
</header>
