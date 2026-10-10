<script lang="ts">
  export let eyebrow='';
  export let title='';
  export let subtitle='';
  export let description='';
  export let compact=false;
</script>

<section class="w-full max-w-none">
  {#if eyebrow}<p class="mb-3 text-[12px] font-medium text-black/45">{eyebrow}</p>{/if}
  <h1 class={compact ? "w-full text-balance text-[38px] font-semibold leading-[1.06] tracking-[-0.025em] md:text-[48px]" : "w-full text-balance text-[42px] font-semibold leading-[1.04] tracking-[-0.03em] md:text-[56px]"}>{title}</h1>
  {#if subtitle}<p class="mt-4 w-full text-balance text-[20px] font-normal leading-[1.3] tracking-[-0.01em] text-black/62 md:text-[26px]">{subtitle}</p>{/if}
  {#if description}<p class="mt-5 w-full hyphens-auto text-justify text-[15px] leading-7 text-black/56 md:text-[16px]">{description}</p>{/if}
</section>
