<script lang="ts">
  import { theme } from '../theme';
  import { renderMermaid } from '../mermaid';
  export let html = '';
  export let hasMermaid = false;
  let root: HTMLElement;
  let diagramError = '';
  let renderVersion = 0;

  async function hydrateDiagrams(currentTheme: 'light' | 'dark') {
    if (!hasMermaid || !root) return;
    const version = ++renderVersion;
    try {
      await renderMermaid(root, currentTheme);
      if (version === renderVersion) diagramError = '';
    } catch {
      if (version === renderVersion) diagramError = 'This diagram could not be rendered.';
    }
  }

  $: if (root && hasMermaid) void hydrateDiagrams($theme);
</script>

<div bind:this={root} class="project-markdown">
  <article class="prose prose-neutral max-w-none prose-headings:scroll-mt-28 prose-headings:tracking-[-0.025em] prose-h2:mt-12 prose-h2:text-[30px] prose-h3:mt-8 prose-h3:text-[22px] prose-p:text-[15px] prose-p:leading-7 prose-p:text-black/62 prose-li:text-[15px] prose-li:leading-7 prose-li:text-black/62 prose-a:text-[var(--accent)] prose-a:underline prose-a:underline-offset-4 prose-blockquote:border-[var(--accent)] prose-blockquote:bg-black/[0.025] prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:not-italic prose-code:text-[13px] prose-pre:border prose-pre:border-black/10 prose-pre:bg-black/[0.035] prose-pre:text-black prose-pre:shadow-none prose-table:text-[13px] prose-img:my-8">
    {@html html}
  </article>
  {#if diagramError}<div class="alert alert-error mt-6 rounded-none text-sm">{diagramError}</div>{/if}
</div>
