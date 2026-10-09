<script lang="ts">
  import { onDestroy } from 'svelte';
  import { theme, type Theme } from '../theme';
  import { renderMermaid } from '../mermaid';

  export let html = '';
  export let hasMermaid = false;

  let root: HTMLElement;
  let observer: IntersectionObserver | null = null;
  let renderVersion = 0;
  let renderQueue: Promise<void> = Promise.resolve();

  function showDiagramError(shell: HTMLElement) {
    shell.dataset.state = 'error';
    const skeleton = shell.querySelector<HTMLElement>('.mermaid-skeleton');
    if (skeleton) {
      skeleton.classList.remove('animate-pulse');
      skeleton.innerHTML = '<p class="text-sm text-black/55">This diagram could not be rendered.</p>';
    }
  }

  async function renderShell(shell: HTMLElement, currentTheme: Theme, version: number) {
    const alreadyRendered = shell.dataset.state === 'rendered';
    if (!alreadyRendered) shell.dataset.state = 'loading';

    try {
      await renderMermaid(shell, currentTheme);
      if (version === renderVersion && root?.contains(shell)) shell.dataset.state = 'rendered';
    } catch {
      if (version === renderVersion && root?.contains(shell)) showDiagramError(shell);
    }
  }

  function scheduleRender(shell: HTMLElement, currentTheme: Theme, version: number) {
    renderQueue = renderQueue.then(() => renderShell(shell, currentTheme, version));
  }

  function hydrateDiagrams(currentTheme: Theme) {
    if (!hasMermaid || !root) return;

    const version = ++renderVersion;
    observer?.disconnect();
    observer = null;

    const shells = [...root.querySelectorAll<HTMLElement>('.mermaid-shell')];
    if (!shells.length) return;

    for (const shell of shells.filter((item) => item.dataset.state === 'rendered')) {
      scheduleRender(shell, currentTheme, version);
    }

    const pending = shells.filter((item) => item.dataset.state !== 'rendered');
    if (!pending.length) return;

    if (typeof IntersectionObserver === 'undefined') {
      for (const shell of pending) scheduleRender(shell, currentTheme, version);
      return;
    }

    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const shell = entry.target as HTMLElement;
        observer?.unobserve(shell);
        scheduleRender(shell, currentTheme, version);
      }
    }, { rootMargin: '240px 0px' });

    for (const shell of pending) observer.observe(shell);
  }

  $: if (root && hasMermaid) void hydrateDiagrams($theme);

  onDestroy(() => {
    renderVersion += 1;
    observer?.disconnect();
  });
</script>

<div bind:this={root} class="project-markdown">
  <article class="prose prose-neutral max-w-none prose-headings:scroll-mt-28 prose-headings:tracking-[-0.025em] prose-h2:mt-12 prose-h2:text-[30px] prose-h3:mt-8 prose-h3:text-[22px] prose-p:hyphens-auto prose-p:text-justify prose-p:text-[15px] prose-p:leading-7 prose-p:text-black/62 prose-li:text-[15px] prose-li:leading-7 prose-li:text-black/62 prose-a:text-[var(--accent)] prose-a:underline prose-a:underline-offset-4 prose-blockquote:border-[var(--accent)] prose-blockquote:bg-black/[0.025] prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:not-italic prose-code:text-[13px] prose-pre:border prose-pre:border-black/10 prose-pre:bg-black/[0.035] prose-pre:text-black prose-pre:shadow-none prose-table:text-[13px] prose-img:my-8">
    {@html html}
  </article>
</div>
