<script lang="ts">
  import { afterUpdate } from 'svelte';

  export let src = '';
  export let srcset = '';
  export let sizes = '';
  export let alt = '';
  export let className = '';
  export let eager = false;
  export let fit: 'cover' | 'contain' = 'cover';

  let image: HTMLImageElement;
  let loaded = false;
  let currentSrc = src;

  $: if (src !== currentSrc) {
    currentSrc = src;
    loaded = false;
  }

  afterUpdate(() => {
    if (!loaded && image?.complete && image.naturalWidth > 0) loaded = true;
  });
</script>

<div class={"relative overflow-hidden bg-black/[0.045] " + className}>
  {#if !loaded}
    <div class="absolute inset-0 animate-pulse bg-gradient-to-br from-black/[0.035] via-black/[0.075] to-black/[0.035]"></div>
  {/if}
  <img
    bind:this={image}
    class={"h-full w-full " + (fit === 'contain' ? 'object-contain' : 'object-cover') + " transition-[opacity,transform] duration-500 ease-out " + (loaded ? "scale-100 opacity-100" : "scale-[1.015] opacity-0")}
    {src}
    srcset={srcset || undefined}
    sizes={sizes || undefined}
    {alt}
    loading={eager ? 'eager' : 'lazy'}
    decoding="async"
    fetchpriority={eager ? 'high' : 'auto'}
    on:load={() => loaded = true}
  />
</div>
