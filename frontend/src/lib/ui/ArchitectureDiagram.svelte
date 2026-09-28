<script lang="ts">
  export let nodes: { label: string; meta?: string }[] = [];
</script>

<div class="rounded-none border border-black/10 bg-white/45 p-6 md:p-8">
  <div class="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
    {#each nodes.slice(0,3) as node, i}
      <div class="flex min-h-[112px] flex-col items-center justify-center border border-black/10 bg-[#fafaf8] px-4 text-center shadow-[0_1px_0_rgba(0,0,0,.02)]">
        <span class="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#e9ede5] text-[11px] text-black/60">0{i+1}</span>
        <strong class="text-[14px] font-semibold">{node.label}</strong>
        {#if node.meta}<span class="mt-1 text-[11px] text-black/42">{node.meta}</span>{/if}
      </div>
      {#if i<2}<span class="hidden text-center text-[20px] text-black/30 md:block">→</span>{/if}
    {/each}
  </div>

  <div class="my-5 flex justify-center">
    <span class="h-8 w-px bg-black/12"></span>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    {#each nodes.slice(3,6) as node, i}
      <div class="flex min-h-[104px] flex-col items-center justify-center border border-black/10 bg-[#f7f8f5] px-4 text-center">
        <span class="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#e9ede5] text-[11px] text-black/60">0{i+4}</span>
        <strong class="text-[14px] font-semibold">{node.label}</strong>
        {#if node.meta}<span class="mt-1 text-[11px] text-black/42">{node.meta}</span>{/if}
      </div>
    {/each}
  </div>
</div>
