<script lang="ts">
  import { certificationGroups, pageCopy } from '../lib/structured-content';
  import PageIntro from '../lib/ui/PageIntro.svelte';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <div class="border-b border-black/10 pb-10">
      <PageIntro eyebrow={pageCopy.certifications.eyebrow} title={pageCopy.certifications.title} subtitle={pageCopy.certifications.subtitle} description={pageCopy.certifications.description} compact/>
    </div>

    {#each certificationGroups as group}
      <section class="border-b border-black/10 py-9">
        <div class="flex items-baseline justify-between gap-6">
          <h2 class="text-[28px] font-semibold tracking-[-0.03em]">{group.group}</h2>
          <span class="shrink-0 text-[13px] text-black/45">{group.items.length} credentials</span>
        </div>
        <p class="mt-3 max-w-2xl text-[14px] leading-6 text-black/52">{pageCopy.certifications.body}</p>
        <div class="mt-7 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {#each group.items as cert}
            <article>
              <div class="aspect-[1.78] overflow-hidden border border-black/12 bg-white/55 shadow-[0_1px_8px_rgba(0,0,0,.035)]">
                <MediaImage className="h-full w-full bg-white" src={cert.image} alt={cert.title} fit="contain"/>
              </div>
              <h3 class="mt-4 text-[16px] font-semibold">{cert.title}</h3>
              <p class="mt-1 text-[13px] text-black/52">{cert.issuer}</p>
              {#if cert.year || cert.credentialId}
                <p class="mt-1 text-[12px] text-black/42">
                  {cert.year}{#if cert.year && cert.credentialId} · {/if}{#if cert.credentialId}Credential ID: {cert.credentialId}{/if}
                </p>
              {/if}
              {#if cert.url}<a class="mt-3 inline-block text-[12px] text-black/68 underline underline-offset-4" href={cert.url}>View Credential →</a>{/if}
            </article>
          {/each}
        </div>
      </section>
    {/each}
  </PageShell>
</main>
