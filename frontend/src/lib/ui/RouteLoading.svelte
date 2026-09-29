<script lang="ts">
  import PageShell from './PageShell.svelte';
</script>

<PageShell className="py-14 lg:py-16">
  <div class="animate-pulse">
    <div class="h-2 w-44 bg-black/10"></div>
    <div class="mt-6 h-12 w-full max-w-xl bg-black/[0.08]"></div>
    <div class="mt-4 h-9 w-full max-w-3xl bg-black/[0.06]"></div>
    <div class="mt-3 h-9 w-2/3 max-w-2xl bg-black/[0.06]"></div>
    <div class="mt-12 grid gap-8 lg:grid-cols-2">
      <div class="aspect-[1.65] bg-black/[0.055]"></div>
      <div class="space-y-4 py-3">
        <div class="h-4 w-24 bg-black/[0.08]"></div>
        <div class="h-8 w-2/3 bg-black/[0.08]"></div>
        <div class="h-4 w-full bg-black/[0.05]"></div>
        <div class="h-4 w-5/6 bg-black/[0.05]"></div>
        <div class="h-4 w-3/4 bg-black/[0.05]"></div>
      </div>
    </div>
  </div>
</PageShell>
