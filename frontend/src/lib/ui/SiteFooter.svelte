<script lang="ts">
  import { Github, Linkedin, Sun } from 'lucide-svelte';
  import { nav } from '../data';
  import { navigate } from '../router';
</script>
<footer class="border-t border-base-300"><div class="mx-auto grid max-w-7xl gap-6 px-4 py-6 text-xs text-base-content/60 lg:grid-cols-[1fr_auto_1fr] lg:px-8"><div class="flex items-center gap-5"><strong class="text-lg text-base-content">AM</strong><span>Alex Morgan<br/>Software Engineer</span></div><nav class="hidden items-center gap-4 lg:flex">{#each nav as item}<a class="link link-hover" href={item[1]} on:click={(e)=>navigate(e,item[1])}>{item[0]}</a>{/each}</nav><div class="flex items-center gap-3 lg:justify-self-end"><Github size={15}/><Linkedin size={15}/><Sun size={15}/><span class="ml-2">© 2026 Alex Morgan. All rights reserved.</span></div></div></footer>
