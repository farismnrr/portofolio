<script lang="ts">
  export let src = '';
  export let alt = '';
  export let className = '';
  export let eager = false;
  let loaded = false;
</script>

<div class={"relative overflow-hidden bg-black/[0.045] " + className}>
  {#if !loaded}
    <div class="absolute inset-0 animate-pulse bg-gradient-to-br from-black/[0.035] via-black/[0.075] to-black/[0.035]"></div>
  {/if}
  <img
    class={"h-full w-full object-cover transition-[opacity,transform] duration-500 ease-out " + (loaded ? "scale-100 opacity-100" : "scale-[1.015] opacity-0")}
    {src}
    {alt}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    fetchpriority={eager ? 'high' : 'auto'}
    on:load={() => loaded = true}
  />
</div>
