<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Certification } from '../structured-content';
  import MediaImage from './MediaImage.svelte';
  import AppIcon from './AppIcon.svelte';

  const dispatch = createEventDispatcher<{ close: void }>();
  let dialog: HTMLDialogElement;
  let credential: Certification | null = null;
  let page = 0;
  $: pages = credential ? [credential.url.startsWith('/images/') ? credential.url : credential.image.replace(/-800\.webp$/, '-1600.webp'), credential.reverseImage].filter(Boolean) : [];

  export function open(selected: Certification) {
    credential = selected;
    page = 0;
    if (!dialog.open) dialog.showModal();
  }

  export function close() {
    if (dialog.open) dialog.close();
  }

  function navigate(direction: number) {
    page = Math.max(0, Math.min(pages.length - 1, page + direction));
  }

  function handleKey(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigate(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }
</script>

<dialog bind:this={dialog} on:keydown={handleKey} on:close={() => { if (!dialog.open) dispatch('close'); }} aria-labelledby="credential-title" class="m-auto max-h-[95dvh] w-[calc(100vw-1rem)] max-w-[1000px] rounded-xl border border-black/20 bg-[var(--surface)] p-0 text-black backdrop:bg-black/75">
  {#if credential}
    <header class="flex items-start justify-between gap-4 border-b border-black/16 p-4 sm:px-6">
      <div>
        <h2 id="credential-title" class="text-[16px] font-semibold leading-6">{credential.title}</h2>
        <p class="mt-1 text-[12px] text-black/58">{credential.issuer}</p>
      </div>
      <button type="button" class="btn btn-ghost min-h-11 min-w-11 rounded-lg" aria-label="Close credential viewer" on:click={() => dialog.close()}><AppIcon name="close" size={20}/></button>
    </header>
    <div class="relative px-14 py-3 sm:px-16">
      <MediaImage src={pages[page]} alt={`${credential.title}, ${page === 0 ? 'front' : 'back'}`} fit="contain" eager className="h-[65dvh] w-full overflow-hidden rounded-lg"/>
      {#if pages.length > 1}
        <button type="button" class="btn btn-ghost absolute left-1 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded-lg sm:left-2" aria-label="Previous credential page" disabled={page === 0} on:click={() => navigate(-1)}><AppIcon name="chevron-left" size={24}/></button>
        <button type="button" class="btn btn-ghost absolute right-1 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded-lg sm:right-2" aria-label="Next credential page" disabled={page === pages.length - 1} on:click={() => navigate(1)}><AppIcon name="chevron-right" size={24}/></button>
      {/if}
    </div>
    <footer class="border-t border-black/16 p-3 text-center text-[13px]" aria-live="polite">
      {page === 0 ? 'Front' : 'Back'} · {page + 1} / {pages.length}
      {#if credential.url && !credential.url.startsWith('/images/')}<a class="ml-4 underline underline-offset-4" href={credential.url} target="_blank" rel="noopener noreferrer">Verify with issuer →</a>{/if}
    </footer>
  {/if}
</dialog>
