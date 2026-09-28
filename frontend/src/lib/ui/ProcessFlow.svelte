<script lang="ts">
  export let steps: { title: string; description: string }[] = [];
</script>

<div class="border border-black/10 bg-white/40 p-5 md:p-7">
  <div class="grid gap-0 md:grid-cols-5">
    {#each steps as step, i}
      <div class="relative px-3 py-4 md:px-4">
        <div class="flex items-center gap-3">
          <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e8ede4] text-[11px] font-medium text-black/65">{i+1}</span>
          {#if i<steps.length-1}<span class="hidden h-px flex-1 bg-black/14 md:block"></span>{/if}
        </div>
        <h3 class="mt-4 text-[14px] font-semibold">{step.title}</h3>
        <p class="mt-2 text-[12px] leading-5 text-black/48">{step.description}</p>
      </div>
    {/each}
  </div>
</div>
