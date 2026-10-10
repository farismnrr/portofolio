<script lang="ts">
  import { gallery, pageCopy } from '../lib/structured-content';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <header class="border-b border-black/10 pb-9">
      <h1 class="text-[40px] font-semibold tracking-[-0.03em] md:text-[48px]">{pageCopy.gallery.title}</h1>
      <p class="mt-4 max-w-none hyphens-auto text-justify text-[16px] leading-7 text-black/58">{pageCopy.gallery.subtitle}</p>
    </header>

    <div class="grid gap-x-5 gap-y-8 pt-8 sm:grid-cols-2 lg:grid-cols-3">
      {#each gallery as item}
        <figure>
          <MediaImage className="aspect-[4/3] w-full" src={item.image} alt={item.caption}/>
          {#if item.caption}<figcaption class="mt-2 text-[12px] leading-5 text-black/46">{item.caption}</figcaption>{/if}
        </figure>
      {/each}
    </div>
  </PageShell>
</main>
