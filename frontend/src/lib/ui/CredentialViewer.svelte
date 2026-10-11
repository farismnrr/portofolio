<script lang="ts">
  import type { Certification } from '../structured-content';
  import MediaImage from './MediaImage.svelte';

  let dialog: HTMLDialogElement;
  let credential: Certification | null = null;
  let page = 0;
  $: pages = credential ? [credential.url.startsWith('/images/') ? credential.url : credential.image.replace(/-800\.webp$/, '-1600.webp'), credential.reverseImage].filter(Boolean) : [];

  export function open(selected: Certification) {
    credential = selected;
    page = 0;
    dialog.showModal();
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

<dialog bind:this={dialog} on:keydown={handleKey} aria-labelledby="credential-title" class="m-auto max-h-[95dvh] w-[calc(100vw-1rem)] max-w-[1000px] border border-black/20 bg-[var(--surface)] p-0 text-black backdrop:bg-black/75">
  {#if credential}
    <header class="flex items-start justify-between gap-4 border-b border-black/16 p-4 sm:px-6">
      <div>
        <h2 id="credential-title" class="text-[16px] font-semibold leading-6">{credential.title}</h2>
        <p class="mt-1 text-[12px] text-black/58">{credential.issuer}</p>
      </div>
      <button type="button" class="min-h-11 min-w-11 border border-black/20 text-[24px]" aria-label="Close credential viewer" on:click={() => dialog.close()}>×</button>
    </header>
    <div class="relative px-14 py-3 sm:px-16">
      <MediaImage src={pages[page]} alt={`${credential.title}, ${page === 0 ? 'front' : 'back'}`} fit="contain" eager className="h-[65dvh] w-full"/>
      {#if pages.length > 1}
        <button type="button" class="absolute left-1 top-1/2 min-h-12 min-w-12 -translate-y-1/2 border border-black/20 text-[32px] disabled:opacity-25 sm:left-2" aria-label="Previous credential page" disabled={page === 0} on:click={() => navigate(-1)}>‹</button>
        <button type="button" class="absolute right-1 top-1/2 min-h-12 min-w-12 -translate-y-1/2 border border-black/20 text-[32px] disabled:opacity-25 sm:right-2" aria-label="Next credential page" disabled={page === pages.length - 1} on:click={() => navigate(1)}>›</button>
      {/if}
    </div>
    <footer class="border-t border-black/16 p-3 text-center text-[13px]" aria-live="polite">
      {page === 0 ? 'Front' : 'Back'} · {page + 1} / {pages.length}
      {#if credential.url && !credential.url.startsWith('/images/')}<a class="ml-4 underline underline-offset-4" href={credential.url} target="_blank" rel="noopener noreferrer">Verify with issuer →</a>{/if}
    </footer>
  {/if}
</dialog>
