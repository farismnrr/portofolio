<script lang="ts">
  import { navigate } from '../lib/router';
  import { prefetchRoute } from '../lib/routes';
  import PageShell from '../lib/ui/PageShell.svelte';
</script>

<main>
  <PageShell className="py-20 sm:py-24 lg:py-28">
    <section class="border-t border-black/14 pt-8 sm:pt-10">
      <p class="text-[12px] font-medium text-black/58">404</p>
      <h1 class="mt-4 text-balance text-[36px] font-semibold leading-[1.08] tracking-[-0.03em] sm:text-[44px] md:text-[52px]">This page does not exist.</h1>
      <p class="mt-5 text-[15px] leading-7 text-black/62 sm:text-[16px]">The requested URL is not part of this portfolio.</p>
      <a
        class="mt-7 inline-flex min-h-11 items-center text-[14px] font-medium text-[var(--accent)] underline decoration-current/35 underline-offset-4 hover:text-black"
        href="/"
        on:mouseenter={() => prefetchRoute('/')}
        on:focus={() => prefetchRoute('/')}
        on:click={(event) => navigate(event, '/')}
      >Return to portfolio →</a>
    </section>
  </PageShell>
</main>
