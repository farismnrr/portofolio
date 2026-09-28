<script lang="ts">
  export let eyebrow='';
  export let title='';
  export let action='';
  export let href='#';
</script>

<div class="mb-8 flex items-end justify-between gap-5">
  <div>
    {#if eyebrow}<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/48">{eyebrow}</p>{/if}
    {#if title}<h2 class="mt-2 text-[30px] font-semibold tracking-[-0.03em] md:text-[36px]">{title}</h2>{/if}
  </div>
  {#if action}<a class="text-[12px] text-black/70 underline decoration-black/30 underline-offset-4 hover:text-black" {href}>{action} →</a>{/if}
</div>
