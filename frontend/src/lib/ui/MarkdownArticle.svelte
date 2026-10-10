<script lang="ts">
  import { afterUpdate, onDestroy, onMount } from 'svelte';
  import { navigate } from '../router';
  import { theme, type Theme } from '../theme';
  import { fitMermaidCanvas, renderMermaid } from '../mermaid';

  export let html = '';
  export let hasMermaid = false;

  let root: HTMLElement;
  let observer: IntersectionObserver | null = null;
  let renderVersion = 0;
  let renderQueue: Promise<void> = Promise.resolve();
  let resizeObserver: ResizeObserver | null = null;
  let hydratedHtml: string | null = null;
  let hydratedTheme: Theme | null = null;

  function interceptLinks(node: HTMLElement) {
    const handleClick = (event: MouseEvent) => {
      const anchor = event.target instanceof Element
        ? event.target.closest<HTMLAnchorElement>('a[href]')
        : null;
      if (!anchor || !node.contains(anchor)) return;
      const href = anchor.getAttribute('href');
      if (href) navigate(event, href);
    };

    node.addEventListener('click', handleClick);
    return {
      destroy() {
        node.removeEventListener('click', handleClick);
      }
    };
  }

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
      if (version === renderVersion && root?.contains(shell)) {
        shell.dataset.state = 'rendered';
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        if (version === renderVersion && root?.contains(shell)) fitMermaidCanvas(shell);
      }
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

  afterUpdate(() => {
    if (!root) return;

    if (!hasMermaid) {
      observer?.disconnect();
      observer = null;
      renderVersion += 1;
      hydratedHtml = html;
      hydratedTheme = $theme;
      return;
    }

    if (hydratedHtml === html && hydratedTheme === $theme) return;
    hydratedHtml = html;
    hydratedTheme = $theme;
    hydrateDiagrams($theme);
  });

  onMount(() => {
    if (!root || typeof ResizeObserver === 'undefined') return;
    let narrow = root.clientWidth < 640;
    resizeObserver = new ResizeObserver(() => {
      const next = root.clientWidth < 640;
      if (next === narrow) return;
      narrow = next;
      hydrateDiagrams($theme);
    });
    resizeObserver.observe(root);
  });

  onDestroy(() => {
    renderVersion += 1;
    observer?.disconnect();
    resizeObserver?.disconnect();
  });
</script>

<div bind:this={root} use:interceptLinks class="project-markdown">
  <article class="prose prose-neutral max-w-none prose-headings:scroll-mt-28 prose-headings:text-balance prose-headings:tracking-[-0.025em] prose-h2:mt-12 prose-h2:border-t prose-h2:border-black/10 prose-h2:pt-8 prose-h2:text-[27px] sm:prose-h2:mt-14 sm:prose-h2:pt-10 sm:prose-h2:text-[30px] 2xl:prose-h2:text-[32px] prose-h3:mt-8 prose-h3:text-[20px] sm:prose-h3:mt-9 sm:prose-h3:text-[22px] 2xl:prose-h3:text-[24px] prose-p:hyphens-auto prose-p:text-left prose-p:text-[15px] prose-p:leading-7 prose-p:text-black/62 sm:prose-p:text-justify 2xl:prose-p:text-[16px] 2xl:prose-p:leading-8 prose-li:hyphens-auto prose-li:text-left prose-li:text-[15px] prose-li:leading-7 prose-li:text-black/62 sm:prose-li:text-justify 2xl:prose-li:text-[16px] 2xl:prose-li:leading-8 prose-a:text-[var(--accent)] prose-a:underline prose-a:underline-offset-4 prose-blockquote:border-[var(--accent)] prose-blockquote:bg-black/[0.025] prose-blockquote:px-4 prose-blockquote:py-1 sm:prose-blockquote:px-5 prose-blockquote:not-italic prose-code:text-[13px] prose-pre:overflow-x-auto prose-pre:border prose-pre:border-black/10 prose-pre:bg-black/[0.035] prose-pre:text-black prose-pre:shadow-none prose-table:text-[13px] 2xl:prose-table:text-[14px] prose-img:my-7 sm:prose-img:my-8">
    {@html html}
  </article>
</div>
