<script lang="ts">
  export let eyebrow='';
  export let title='';
  export let subtitle='';
  export let description='';
  export let compact=false;
</script>

<section class="max-w-5xl">
  {#if eyebrow}<p class="mb-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/45">{eyebrow}</p>{/if}
  <h1 class={compact ? "max-w-[18ch] text-[40px] font-semibold leading-[1.04] tracking-[-0.035em] md:text-[52px]" : "max-w-[18ch] text-[44px] font-semibold leading-[1.03] tracking-[-0.04em] md:text-[60px]"}>{title}</h1>
  {#if subtitle}<p class="mt-4 max-w-[28ch] text-[22px] font-light leading-[1.18] tracking-[-0.02em] text-black/60 md:text-[30px]">{subtitle}</p>{/if}
  {#if description}<p class="mt-5 max-w-[66ch] text-[15px] leading-7 text-black/56 md:text-[16px]">{description}</p>{/if}
</section>
