<script lang="ts">
  import { projectImageSrcset } from '../project-content';
  import AppIcon from './AppIcon.svelte';
  import MediaImage from './MediaImage.svelte';

  export let images: string[];
  export let title: string;
  let currentSlide = 0;
  let previousImages = images;
  $: if (images !== previousImages) {
    previousImages = images;
    currentSlide = 0;
  }

  function move(direction: number) {
    if (images.length < 2) return;
    currentSlide = (currentSlide + direction + images.length) % images.length;
  }

  function handleKey(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  }
</script>

<section class="carousel relative flex min-h-0 items-center overflow-hidden rounded-lg bg-base-200 p-3 pb-16 sm:p-5 sm:pb-16" aria-roledescription="carousel" aria-label={`${title} images`}>
  {#if images.length > 1}<span class="sr-only" aria-live="polite">Slide {currentSlide + 1} of {images.length}</span>{/if}
  {#if images.length}
    <div class="carousel-item w-full" role="group" aria-roledescription="slide" aria-label={`${currentSlide + 1} of ${images.length}`}>
      <MediaImage
        src={images[currentSlide]}
        srcset={projectImageSrcset(images[currentSlide])}
        sizes="(min-width: 1024px) 640px, calc(100vw - 2rem)"
        alt={`${title}, image ${currentSlide + 1}`}
        fit="contain"
        eager
        className="aspect-video w-full"
      />
    </div>
  {:else}
    <div class="flex aspect-video w-full items-center justify-center text-base-content/70" role="status">Image unavailable</div>
  {/if}

  {#if images.length > 1}
    <button type="button" class="btn btn-ghost absolute left-2 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded-lg bg-base-100/90 shadow-sm sm:left-4" aria-label="Previous image" on:click={() => move(-1)} on:keydown={handleKey}>
      <AppIcon name="chevron-left" size={24}/>
    </button>
    <button type="button" class="btn btn-ghost absolute right-2 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded-lg bg-base-100/90 shadow-sm sm:right-4" aria-label="Next image" on:click={() => move(1)} on:keydown={handleKey}>
      <AppIcon name="chevron-right" size={24}/>
    </button>
    <div class="absolute inset-x-0 bottom-1 flex justify-center" role="group" aria-label="Choose image">
        <div class="join rounded-lg bg-base-100/90 shadow-sm">
        {#each images as _, index}
          <button
            type="button"
            class="btn btn-ghost join-item min-h-11 min-w-11 px-3"
            tabindex="-1"
            aria-label={`Show image ${index + 1}`}
            aria-current={currentSlide === index ? 'true' : undefined}
            on:click={() => currentSlide = index}
          ><span class={`size-2.5 rounded-full ${currentSlide === index ? 'bg-primary' : 'bg-base-content/30'}`}></span></button>
        {/each}
      </div>
    </div>
  {/if}
</section>
