<script lang="ts">
  import { gallery, pageCopy } from '../lib/structured-content';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';

  const sizeClass = {
    wide: 'sm:col-span-2 lg:col-span-6 lg:row-span-3',
    tall: 'lg:col-span-4 lg:row-span-4',
    large: 'lg:col-span-4 lg:row-span-3',
    normal: 'lg:col-span-3 lg:row-span-2'
  } as const;
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <PageIntro eyebrow={pageCopy.gallery.eyebrow} title={pageCopy.gallery.title} subtitle={pageCopy.gallery.subtitle} description={pageCopy.gallery.description} compact/>

    <div class="mt-10 grid auto-rows-[130px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
      {#each gallery as item}
        <figure class={sizeClass[item.size]}>
          <MediaImage className="h-[calc(100%-22px)] min-h-[100px] w-full" src={item.image} alt={item.caption}/>
          <figcaption class="mt-2 text-[11px] text-black/45">{item.caption}</figcaption>
        </figure>
      {/each}
    </div>
  </PageShell>
</main>
