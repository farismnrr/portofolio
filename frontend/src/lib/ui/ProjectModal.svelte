<script lang="ts">
  import { tick } from 'svelte';
  import type { ProjectDocument } from '../project-content';
  import { getProjectContributionsBySlug } from '../project-markdown';
  import AppIcon from './AppIcon.svelte';
  import KindBadge from './KindBadge.svelte';
  import ProjectImageCarousel from './ProjectImageCarousel.svelte';
  import SiteLink from './SiteLink.svelte';
  import TechList from './TechList.svelte';

  let dialog: HTMLDialogElement;
  let closeButton: HTMLButtonElement;
  let selected: ProjectDocument | null = null;
  let returnFocus: HTMLElement | null = null;

  $: images = selected?.images.length ? selected.images : selected ? [selected.image] : [];
  $: contributions = selected ? getProjectContributionsBySlug(selected.slug) : [];

  export async function open(project: ProjectDocument, trigger: HTMLElement) {
    selected = project;
    returnFocus = trigger;
    await tick();
    if (!dialog.open) dialog.showModal();
    closeButton.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  function handleClose() {
    returnFocus?.focus();
    returnFocus = null;
  }
</script>

<dialog bind:this={dialog} class="modal" on:close={handleClose} aria-labelledby="project-modal-title">
  {#if selected}
    <div class="modal-box grid h-[min(92dvh,680px)] w-[calc(100vw-1rem)] max-w-[1120px] grid-cols-1 gap-0 overflow-y-auto rounded-xl p-0 lg:grid-cols-[1.16fr_0.84fr] lg:overflow-hidden">
      <ProjectImageCarousel images={images} title={selected.title}/>

      <div class="flex min-h-0 flex-col bg-base-100 p-5 sm:p-7 lg:overflow-y-auto">
        <header class="flex items-start justify-between gap-4">
          <div>
          <p class="text-xs font-medium uppercase tracking-[0.14em] text-base-content/70">Project details</p>
            <h2 id="project-modal-title" class="mt-2 text-2xl font-semibold leading-tight tracking-tight text-base-content">{selected.title}</h2>
          </div>
          <button bind:this={closeButton} type="button" class="btn btn-ghost btn-circle min-h-11 min-w-11 shrink-0 rounded-md" aria-label="Close project details" on:click={close}>
            <AppIcon name="close" size={20}/>
          </button>
        </header>

        <div class="divider my-3"></div>
        <div class="space-y-5 text-sm">
          <section>
            <h3 class="font-semibold text-base-content">What I did</h3>
            {#if contributions.length}
              <ul class="mt-2 list-disc space-y-1.5 pl-5 leading-6 text-base-content/75">
                {#each contributions as contribution}
                  <li>{contribution}</li>
                {/each}
              </ul>
            {:else}
              <p class="mt-2 text-base-content/70">-</p>
            {/if}
          </section>

          <section>
            <h3 class="mb-2 font-semibold text-base-content">Tech stack</h3>
            <TechList items={selected.tech}/>
          </section>

          <section class="space-y-3 border-t border-base-300 pt-4">
            <div>
              <h3 class="mb-2 font-semibold text-base-content">Type</h3>
              <KindBadge kind={selected.kind}/>
            </div>
            <div>
              <h3 class="mb-1 font-semibold text-base-content">Site</h3>
              <SiteLink site={selected.site}/>
            </div>
          </section>
        </div>
      </div>
    </div>

    <form method="dialog" class="modal-backdrop">
      <button aria-label="Close project details">close</button>
    </form>
  {/if}
</dialog>
