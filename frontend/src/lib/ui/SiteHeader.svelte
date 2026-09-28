<script lang="ts">
  import { Github, Linkedin, Sun } from 'lucide-svelte';
  import { nav } from '../data';
  import { navigate } from '../router';
  export let currentPath = '/';
</script>

<header class="sticky top-0 z-50 border-b border-base-300 bg-base-100/95 backdrop-blur">
  <div class="navbar mx-auto max-w-7xl px-4 lg:px-8">
    <div class="navbar-start"><a href="/" on:click={(e)=>navigate(e,'/')} class="btn btn-ghost px-0 text-lg font-semibold tracking-tight">AM</a></div>
    <div class="navbar-center hidden lg:flex"><ul class="menu menu-horizontal gap-1 px-1 text-xs">{#each nav as item}<li><a class:font-semibold={currentPath===item[1]} class:border-b-2={currentPath===item[1]} class:border-neutral={currentPath===item[1]} href={item[1]} on:click={(e)=>navigate(e,item[1])}>{item[0]}</a></li>{/each}</ul></div>
    <div class="navbar-end gap-1"><a class="btn btn-circle btn-ghost btn-sm" aria-label="GitHub" href="https://github.com"><Github size={17}/></a><a class="btn btn-circle btn-ghost btn-sm" aria-label="LinkedIn" href="https://linkedin.com"><Linkedin size={17}/></a><div class="divider divider-horizontal mx-1"></div><button class="btn btn-circle btn-ghost btn-sm" aria-label="Theme"><Sun size={17}/></button></div>
  </div>
</header>
