<script lang="ts">
  export let eyebrow='';
  export let title='';
  export let subtitle='';
  export let description='';
  export let compact=false;
</script>

<section class="w-full max-w-none">
  {#if eyebrow}<p class="mb-3 text-[12px] font-medium text-black/45 2xl:text-[13px]">{eyebrow}</p>{/if}
  <h1 class={compact ? "w-full text-balance text-[34px] font-semibold leading-[1.08] tracking-[-0.025em] sm:text-[38px] md:text-[48px] 2xl:text-[54px]" : "w-full text-balance text-[36px] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-[42px] md:text-[56px] 2xl:text-[64px]"}>{title}</h1>
  {#if subtitle}<p class="mt-4 w-full text-balance text-[18px] font-normal leading-[1.35] tracking-[-0.01em] text-black/62 sm:text-[20px] md:text-[26px] 2xl:text-[30px]">{subtitle}</p>{/if}
  {#if description}<p class="mt-5 w-full hyphens-auto text-left text-[15px] leading-7 text-black/56 sm:text-justify md:text-[16px] 2xl:text-[17px] 2xl:leading-8">{description}</p>{/if}
</section>
