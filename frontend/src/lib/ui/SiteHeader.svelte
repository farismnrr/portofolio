<script lang="ts">
  import AppIcon from './AppIcon.svelte';
  import { navigation, profile } from '../structured-content';
  import { navigate } from '../router';
  import { prefetchRoute } from '../routes';
  import PageShell from './PageShell.svelte';
  export let currentPath = '/';

  const initials = profile.name.split(/\s+/).map((part)=>part[0]).join('').slice(0,2).toUpperCase();
</script>

<header class="sticky top-0 z-50 border-b border-black/10 bg-[#f8f8f6]/95 backdrop-blur-md">
  <PageShell>
    <div class="flex h-[74px] items-center justify-between">
      <a href="/" on:mouseenter={()=>prefetchRoute('/')} on:focus={()=>prefetchRoute('/')} on:click={(e)=>navigate(e,'/')} class="text-[22px] font-semibold tracking-[-0.04em]">{initials}</a>
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
        <button class="btn btn-circle btn-ghost btn-sm" aria-label="Theme"><AppIcon name="sun" size={19}/></button>
      </div>
    </div>
  </PageShell>
</header>
