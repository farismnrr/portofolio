<script lang="ts">
  import { gallery, pageCopy } from '../lib/structured-content';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
</script>

<main>
  <PageShell className="py-10 sm:py-12 lg:py-16">
    <header class="border-b border-black/14 pb-8 sm:pb-9">
      <h1 class="text-[36px] font-semibold tracking-[-0.03em] sm:text-[40px] md:text-[48px] 2xl:text-[52px]">{pageCopy.gallery.title}</h1>
      <p class="mt-4 max-w-none hyphens-auto text-justify text-[15px] leading-7 text-black/62 sm:text-[16px] 2xl:text-[17px] 2xl:leading-8">{pageCopy.gallery.subtitle}</p>
    </header>

    <div class="grid gap-x-4 gap-y-7 pt-7 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-8 sm:pt-8 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-x-6 2xl:gap-y-10">
      {#each gallery as item}
        <figure>
          <MediaImage className="aspect-[4/3] w-full" src={item.image} alt={item.caption}/>
          {#if item.caption}<figcaption class="mt-2 text-[12px] leading-5 text-black/58">{item.caption}</figcaption>{/if}
        </figure>
      {/each}
    </div>
  </PageShell>
</main>
