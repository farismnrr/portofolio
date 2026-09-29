<script lang="ts">
  import { Github, Linkedin, Sun } from 'lucide-svelte';
  import { nav } from '../data';
  import { navigate } from '../router';
  import { prefetchRoute } from '../routes';
  import PageShell from './PageShell.svelte';
  export let currentPath = '/';
</script>

<header class="sticky top-0 z-50 border-b border-black/10 bg-[#f8f8f6]/95 backdrop-blur-md">
  <PageShell>
    <div class="flex h-[74px] items-center justify-between">
      <a href="/" on:mouseenter={()=>prefetchRoute('/')} on:focus={()=>prefetchRoute('/')} on:click={(e)=>navigate(e,'/')} class="text-[22px] font-semibold tracking-[-0.04em]">AM</a>
      <nav class="hidden h-full items-center lg:flex">
        {#each nav as item}
          <a href={item[1]} on:mouseenter={()=>prefetchRoute(item[1])} on:focus={()=>prefetchRoute(item[1])} on:click={(e)=>navigate(e,item[1])} class="relative flex h-full items-center px-[18px] text-[13px] text-black/65 transition hover:text-black" class:text-black={currentPath===item[1]}>
            {item[0]}
            {#if currentPath===item[1]}<span class="absolute inset-x-[14px] bottom-0 h-px bg-black"></span>{/if}
          </a>
        {/each}
      </nav>
      <div class="flex items-center gap-1">
        <a class="btn btn-circle btn-ghost btn-sm" aria-label="GitHub" href="https://github.com"><Github size={19}/></a>
        <a class="btn btn-circle btn-ghost btn-sm" aria-label="LinkedIn" href="https://linkedin.com"><Linkedin size={19}/></a>
        <span class="mx-2 hidden h-6 w-px bg-black/12 sm:block"></span>
        <button class="btn btn-circle btn-ghost btn-sm" aria-label="Theme"><Sun size={19}/></button>
      </div>
    </div>
  </PageShell>
</header>
