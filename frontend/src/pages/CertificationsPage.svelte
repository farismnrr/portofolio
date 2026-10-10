<script lang="ts">
  import { certificationGroupId, certificationGroups, pageCopy } from '../lib/structured-content';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
</script>

<main>
  <PageShell className="py-10 sm:py-12 lg:py-16">
    <header class="border-b border-black/10 pb-8 sm:pb-9">
      <h1 class="text-[36px] font-semibold tracking-[-0.03em] sm:text-[40px] md:text-[48px]">{pageCopy.certifications.title}</h1>
      <p class="mt-4 max-w-none hyphens-auto text-justify text-[15px] leading-7 text-black/58 sm:text-[16px]">{pageCopy.certifications.subtitle}</p>
    </header>

    {#each certificationGroups as group}
      <section id={certificationGroupId(group.group)} class="scroll-mt-28 border-b border-black/10 py-8 sm:py-9">
        <div class="flex items-start justify-between gap-4 sm:items-baseline sm:gap-6">
          <h2 class="text-[24px] font-semibold tracking-[-0.03em] sm:text-[28px]">{group.group}</h2>
          <span class="shrink-0 pt-1 text-[12px] text-black/42 sm:pt-0 sm:text-[13px]">{group.items.length}</span>
        </div>

        <div class="mt-6 grid gap-x-6 gap-y-9 sm:mt-7 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-3">
          {#each group.items as cert}
            <article>
              <div class="aspect-[1.78] overflow-hidden border border-black/12 bg-white/55">
                <MediaImage className="h-full w-full bg-[#fff]" src={cert.image} alt={cert.title} fit="contain"/>
              </div>
              <h3 class="mt-4 text-[16px] font-semibold leading-6">{cert.title}</h3>
              <p class="mt-1 text-[13px] text-black/52">{cert.issuer}</p>
              {#if cert.year || cert.credentialId}
                <p class="mt-1 break-words text-[12px] leading-5 text-black/42">
                  {cert.year}{#if cert.year && cert.credentialId} · {/if}{#if cert.credentialId}Credential ID: {cert.credentialId}{/if}
                </p>
              {/if}
              {#if cert.url}<a class="mt-2 inline-flex min-h-10 items-center text-[12px] text-black/68 underline decoration-black/20 underline-offset-4 hover:text-black sm:mt-3" href={cert.url}>View credential →</a>{/if}
            </article>
          {/each}
        </div>
      </section>
    {/each}
  </PageShell>
</main>
