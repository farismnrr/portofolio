<script lang="ts">
  import { certificationGroupId, certificationGroups, pageCopy } from '../lib/structured-content';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
</script>

<main>
  <PageShell className="py-14 lg:py-16">
    <header class="border-b border-black/10 pb-9">
      <h1 class="text-[40px] font-semibold tracking-[-0.03em] md:text-[48px]">{pageCopy.certifications.title}</h1>
      <p class="mt-4 max-w-none hyphens-auto text-justify text-[16px] leading-7 text-black/58">{pageCopy.certifications.subtitle}</p>
    </header>

    {#each certificationGroups as group}
      <section id={certificationGroupId(group.group)} class="scroll-mt-28 border-b border-black/10 py-9">
        <div class="flex items-baseline justify-between gap-6">
          <h2 class="text-[28px] font-semibold tracking-[-0.03em]">{group.group}</h2>
          <span class="shrink-0 text-[13px] text-black/42">{group.items.length}</span>
        </div>

        <div class="mt-7 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {#each group.items as cert}
            <article>
              <div class="aspect-[1.78] overflow-hidden border border-black/12 bg-white/55">
                <MediaImage className="h-full w-full bg-[#fff]" src={cert.image} alt={cert.title} fit="contain"/>
              </div>
              <h3 class="mt-4 text-[16px] font-semibold leading-6">{cert.title}</h3>
              <p class="mt-1 text-[13px] text-black/52">{cert.issuer}</p>
              {#if cert.year || cert.credentialId}
                <p class="mt-1 text-[12px] leading-5 text-black/42">
                  {cert.year}{#if cert.year && cert.credentialId} · {/if}{#if cert.credentialId}Credential ID: {cert.credentialId}{/if}
                </p>
              {/if}
              {#if cert.url}<a class="mt-3 inline-block text-[12px] text-black/68 underline decoration-black/20 underline-offset-4 hover:text-black" href={cert.url}>View credential →</a>{/if}
            </article>
          {/each}
        </div>
      </section>
    {/each}
  </PageShell>
</main>
