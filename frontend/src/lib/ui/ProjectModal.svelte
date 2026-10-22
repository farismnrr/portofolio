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
  $: tech = selected?.tech.filter((item) => item !== '-').join(', ') || '-';

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
  class="m-auto h-[min(94dvh,680px)] max-h-[94dvh] w-[calc(100vw-1rem)] max-w-[1120px] overflow-hidden border border-[color-mix(in_srgb,var(--page-fg)_20%,transparent)] bg-[var(--surface)] p-0 text-[var(--page-fg)] backdrop:bg-black/75 max-[1023px]:h-auto max-[1023px]:max-h-[90dvh] max-[1023px]:overflow-y-auto max-[1023px]:max-w-[760px] max-[640px]:w-[calc(100vw-1rem)]"
>
  {#if selected}
    <div class="grid h-full min-h-0 grid-cols-[1.22fr_0.78fr] max-[1023px]:h-auto max-[1023px]:grid-cols-1">
    <section class="project-image-panel relative flex min-h-0 items-center bg-[color-mix(in_srgb,var(--page-fg)_3%,var(--surface))] p-3 sm:p-5" aria-roledescription="carousel" aria-label={`${selected.title} images`}>
      <div role="group" aria-roledescription="slide" aria-label={`${slide + 1} of ${images.length}`} class="w-full">
        <MediaImage
          src={images[slide]}
          srcset={projectImageSrcset(images[slide])}
          sizes="(min-width: 1024px) 590px, calc(100vw - 2rem)"
          alt={`${selected.title}, image ${slide + 1}`}
          fit="contain"
          eager
          className="aspect-video w-full"
        />
      </div>
      {#if images.length > 1}
        <button type="button" class="btn btn-ghost btn-circle absolute left-2 top-1/2 min-h-11 min-w-11 -translate-y-1/2 bg-[var(--surface)]/90 shadow-sm sm:left-4" aria-label="Previous image" on:click={() => move(-1)}>
          <AppIcon name="chevron-left" size={24}/>
        </button>
        <button type="button" class="btn btn-ghost btn-circle absolute right-2 top-1/2 min-h-11 min-w-11 -translate-y-1/2 bg-[var(--surface)]/90 shadow-sm sm:right-4" aria-label="Next image" on:click={() => move(1)}>
          <AppIcon name="chevron-right" size={24}/>
        </button>
        <div class="absolute inset-x-0 bottom-2 flex justify-center gap-1" role="group" aria-label="Choose image">
          {#each images as _, index}
            <button
              type="button"
              class="min-h-11 min-w-11 p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              aria-label={`Show image ${index + 1}`}
              aria-current={slide === index ? 'true' : undefined}
              on:click={() => slide = index}
            ><span class={"block h-2.5 w-2.5 rounded-full " + (slide === index ? "bg-[var(--accent)]" : "bg-black/25")}></span></button>
          {/each}
        </div>
      {/if}
    </section>

    <div class="flex min-h-0 flex-col p-4 sm:p-5">
      <header class="mb-3 flex items-start justify-between gap-3 border-b border-[color-mix(in_srgb,var(--page-fg)_16%,transparent)] pb-3">
        <h2 id="project-modal-title" class="text-[20px] font-semibold leading-tight tracking-[-0.02em] sm:text-[23px]">{selected.title}</h2>
        <button type="button" class="btn btn-ghost btn-circle min-h-11 min-w-11 shrink-0" aria-label="Close project details" on:click={close}>
          <AppIcon name="close" size={20}/>
        </button>
      </header>
      <div class="space-y-2.5 text-[13px] leading-[1.35]">
      <section>
        <h3 class="text-[14px] font-semibold">What I did</h3>
        {#if contributions.length}
          <ul class="mt-1 list-disc space-y-0 pl-5 text-[13px] leading-[1.35] text-[color-mix(in_srgb,var(--page-fg)_72%,transparent)]">
            {#each contributions.slice(0, 5) as contribution}<li>{contribution}</li>{/each}
          </ul>
          {#if contributions.length > 5}<p class="mt-1 text-[12px] text-[color-mix(in_srgb,var(--page-fg)_58%,transparent)]">+{contributions.length - 5} more</p>{/if}
        {:else}
          <p class="mt-1 text-[13px] text-[color-mix(in_srgb,var(--page-fg)_58%,transparent)]">-</p>
        {/if}
      </section>
      <section>
        <h3 class="text-[14px] font-semibold">Tech stack</h3>
        <p class="mt-1 text-[13px] leading-[1.35] text-[color-mix(in_srgb,var(--page-fg)_72%,transparent)]">{tech}</p>
      </section>
      <div class="grid grid-cols-2 gap-3">
      <section>
        <h3 class="text-[14px] font-semibold">Type</h3>
        <p class="mt-1 text-[13px] text-[color-mix(in_srgb,var(--page-fg)_72%,transparent)]">{selected.kind || '-'}</p>
      </section>
      <section>
        <h3 class="text-[14px] font-semibold">Site</h3>
        {#if selected.site !== '-'}
          <a class="mt-1 inline-block break-all text-[13px] text-[var(--accent)] underline decoration-current/35 underline-offset-4" href={selected.site} target="_blank" rel="noopener noreferrer">{selected.site}</a>
        {:else}
          <p class="mt-1 text-[13px] text-[color-mix(in_srgb,var(--page-fg)_58%,transparent)]">-</p>
        {/if}
      </section>
      </div>
      </div>
    </div>
    </div>
  {/if}
</dialog>
