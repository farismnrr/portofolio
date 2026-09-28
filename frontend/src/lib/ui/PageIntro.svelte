<script lang="ts">
  export let eyebrow='';
  export let title='';
  export let subtitle='';
  export let description='';
  export let compact=false;
</script>

<section>
  {#if eyebrow}<p class="mb-5 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/48">{eyebrow}</p>{/if}
  <h1 class={compact ? "max-w-5xl text-[44px] font-semibold leading-[1.02] tracking-[-0.04em] md:text-[58px]" : "max-w-6xl text-[50px] font-semibold leading-[1.02] tracking-[-0.045em] md:text-[68px]"}>{title}</h1>
  {#if subtitle}<p class="mt-3 max-w-6xl text-[30px] font-light leading-[1.08] tracking-[-0.03em] text-black/62 md:text-[46px]">{subtitle}</p>{/if}
  {#if description}<p class="mt-5 max-w-3xl text-[15px] leading-7 text-black/56 md:text-[16px]">{description}</p>{/if}
</section>
