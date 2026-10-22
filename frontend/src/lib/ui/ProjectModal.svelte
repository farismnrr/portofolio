<script lang="ts">
  import type { ProjectDocument } from '../project-content';
  import { projectImageSrcset } from '../project-content';
  import { getProjectContributionsBySlug } from '../project-markdown';
  import MediaImage from './MediaImage.svelte';
  import AppIcon from './AppIcon.svelte';

  let dialog: HTMLDialogElement;
  let selected: ProjectDocument | null = null;
  let slide = 0;
  let returnFocus: HTMLElement | null = null;

  $: images = selected?.images.length ? selected.images : selected ? [selected.image] : [];
  $: contributions = selected ? getProjectContributionsBySlug(selected.slug) : [];

  export function open(project: ProjectDocument, trigger: HTMLElement) {
    selected = project;
    slide = 0;
    returnFocus = trigger;
    dialog.showModal();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  function move(direction: number) {
    if (!images.length) return;
    slide = (slide + direction + images.length) % images.length;
  }

  function handleBackdrop(event: MouseEvent) {
    if (event.target === dialog) close();
  }

  function handleClose() {
    returnFocus?.focus();
    returnFocus = null;
  }
</script>

<dialog
  bind:this={dialog}
  on:click={handleBackdrop}
  on:close={handleClose}
  aria-labelledby="project-modal-title"
  class="m-auto max-h-[96dvh] w-[calc(100vw-1rem)] max-w-[900px] overflow-y-auto border border-black/20 bg-[var(--surface)] p-0 text-black backdrop:bg-black/75"
>
  {#if selected}
    <header class="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-black/16 bg-[var(--surface)] px-4 py-3 sm:px-6">
      <h2 id="project-modal-title" class="text-[18px] font-semibold leading-6">{selected.title}</h2>
      <button type="button" class="btn btn-ghost btn-circle min-h-11 min-w-11" aria-label="Close project details" on:click={close}>
        <AppIcon name="close" size={20}/>
      </button>
    </header>

    <section class="relative px-3 py-4 sm:px-8" aria-roledescription="carousel" aria-label={`${selected.title} images`}>
      <div role="group" aria-roledescription="slide" aria-label={`${slide + 1} of ${images.length}`}>
        <MediaImage
          src={images[slide]}
          srcset={projectImageSrcset(images[slide])}
          sizes="(min-width: 900px) 820px, calc(100vw - 2rem)"
          alt={`${selected.title}, image ${slide + 1}`}
          fit="contain"
          eager
          className="h-[34dvh] min-h-[190px] w-full sm:h-[42dvh]"
        />
      </div>
      {#if images.length > 1}
        <button type="button" class="btn btn-ghost btn-circle absolute left-1 top-1/2 min-h-11 min-w-11 -translate-y-1/2 sm:left-3" aria-label="Previous image" on:click={() => move(-1)}>
          <AppIcon name="chevron-left" size={24}/>
        </button>
        <button type="button" class="btn btn-ghost btn-circle absolute right-1 top-1/2 min-h-11 min-w-11 -translate-y-1/2 sm:right-3" aria-label="Next image" on:click={() => move(1)}>
          <AppIcon name="chevron-right" size={24}/>
        </button>
        <div class="mt-2 flex justify-center gap-2" aria-label="Choose image">
          {#each images as _, index}
            <button
              type="button"
              class="min-h-11 min-w-11 p-3"
              aria-label={`Show image ${index + 1}`}
              aria-current={slide === index ? 'true' : undefined}
              on:click={() => slide = index}
            ><span class={"block h-2.5 w-2.5 rounded-full " + (slide === index ? "bg-[var(--accent)]" : "bg-black/25")}></span></button>
          {/each}
        </div>
      {/if}
    </section>

    <div class="space-y-5 px-4 pb-6 sm:px-8">
      <section>
        <h3 class="text-[14px] font-semibold">What I did</h3>
        {#if contributions.length}
          <ul class="mt-2 list-disc space-y-1 pl-5 text-[14px] leading-6 text-black/70">
            {#each contributions as contribution}<li>{contribution}</li>{/each}
          </ul>
        {:else}
          <p class="mt-2 text-[14px] text-black/58">-</p>
        {/if}
      </section>
      <section>
        <h3 class="text-[14px] font-semibold">Tech stack</h3>
        <p class="mt-1 text-[14px] leading-6 text-black/70">{selected.tech.length ? selected.tech.join(', ') : '-'}</p>
      </section>
      <section>
        <h3 class="text-[14px] font-semibold">Type</h3>
        <p class="mt-1 text-[14px] text-black/70">{selected.kind || '-'}</p>
      </section>
      <section>
        <h3 class="text-[14px] font-semibold">Site</h3>
        {#if selected.site !== '-'}
          <a class="mt-1 inline-block break-all text-[14px] text-[var(--accent)] underline decoration-current/35 underline-offset-4" href={selected.site} target="_blank" rel="noopener noreferrer">{selected.site}</a>
        {:else}
          <p class="mt-1 text-[14px] text-black/58">-</p>
        {/if}
      </section>
    </div>
  {/if}
</dialog>
