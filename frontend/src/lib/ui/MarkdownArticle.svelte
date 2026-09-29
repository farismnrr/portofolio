<script lang="ts">
  import { onMount } from 'svelte';
  import { renderMermaid } from '../mermaid';
  export let html = '';
  export let hasMermaid = false;
  let root: HTMLElement;
  let diagramError = '';
  onMount(() => {
    let active = true;
    async function hydrateDiagrams() {
      if (!hasMermaid || !root) return;
      try { await renderMermaid(root); } catch { if (active) diagramError = 'This diagram could not be rendered.'; }
    }
    void hydrateDiagrams();
    return () => { active = false; };
  });
</script>

<div bind:this={root} class="project-markdown">
  <article class="prose prose-neutral max-w-none prose-headings:scroll-mt-28 prose-headings:tracking-[-0.025em] prose-h2:mt-12 prose-h2:text-[30px] prose-h3:mt-8 prose-h3:text-[22px] prose-p:text-[15px] prose-p:leading-7 prose-p:text-black/62 prose-li:text-[15px] prose-li:leading-7 prose-li:text-black/62 prose-a:text-[#344534] prose-a:underline prose-a:underline-offset-4 prose-blockquote:border-[#465d3f] prose-blockquote:bg-black/[0.025] prose-blockquote:px-5 prose-blockquote:py-1 prose-blockquote:not-italic prose-code:text-[13px] prose-table:text-[13px] prose-img:my-8">
    {@html html}
  </article>
  {#if diagramError}<div class="alert alert-error mt-6 rounded-none text-sm">{diagramError}</div>{/if}
</div>
