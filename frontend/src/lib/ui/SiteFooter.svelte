<script lang="ts">
  import { Github, Linkedin, Sun } from '@lucide/svelte';
  import { nav } from '../data';
  import { navigate } from '../router';
  import PageShell from './PageShell.svelte';
</script>

<footer class="border-t border-black/10 bg-[#f8f8f6]">
  <PageShell>
    <div class="grid min-h-[90px] items-center gap-6 py-6 text-[11px] text-black/48 lg:grid-cols-[1fr_auto_1fr]">
      <div class="flex items-center gap-6">
        <strong class="text-[20px] font-semibold tracking-tight text-black">AM</strong>
        <span class="leading-4">Alex Morgan<br/>Software Engineer</span>
      </div>
      <nav class="hidden items-center gap-5 lg:flex">
        {#each nav as item}<a class="hover:text-black" href={item[1]} on:click={(e)=>navigate(e,item[1])}>{item[0]}</a>{/each}
      </nav>
      <div class="flex items-center gap-4 lg:justify-self-end">
        <Github size={15}/><Linkedin size={15}/><Sun size={15}/>
        <span class="ml-2">© 2026 Alex Morgan. All rights reserved.</span>
      </div>
    </div>
  </PageShell>
</footer>
