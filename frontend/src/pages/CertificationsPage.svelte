<script lang="ts">
  import { onMount } from 'svelte';
  import { certificationId, certifications, certificationGroupId, certificationGroups, pageCopy, type Certification } from '../lib/structured-content';
  import PageShell from '../lib/ui/PageShell.svelte';
  import MediaImage from '../lib/ui/MediaImage.svelte';
  import CredentialViewer from '../lib/ui/CredentialViewer.svelte';

  let viewer: CredentialViewer;

  function syncCredentialHash() {
    const selected = certifications.find((cert) => `#${certificationId(cert)}` === window.location.hash);
    if (selected) viewer.open(selected);
    else viewer.close();
  }

  function openCredential(event: MouseEvent, cert: Certification) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const hash = `#${certificationId(cert)}`;
    if (window.location.hash !== hash) history.pushState({}, '', hash);
    syncCredentialHash();
  }

  function closeCredential() {
    if (certifications.some((cert) => `#${certificationId(cert)}` === window.location.hash)) {
      history.replaceState(history.state, '', `${window.location.pathname}${window.location.search}`);
    }
  }

  onMount(() => {
    syncCredentialHash();
    window.addEventListener('hashchange', syncCredentialHash);
    window.addEventListener('popstate', syncCredentialHash);
    return () => {
      window.removeEventListener('hashchange', syncCredentialHash);
      window.removeEventListener('popstate', syncCredentialHash);
    };
  });

  function responsiveCertificationSrcset(src: string) {
    const match = src.match(/^(.*)-800\.webp$/);
    if (!match) return '';
    return [480, 800].map((width) => `${match[1]}-${width}.webp ${width}w`).join(', ');
  }
</script>

<main>
  <PageShell className="py-10 sm:py-12 lg:py-16">
    <header class="border-b border-black/10 pb-8 sm:pb-9">
      <h1 class="text-[36px] font-semibold tracking-[-0.03em] sm:text-[40px] md:text-[48px] 2xl:text-[52px]">{pageCopy.certifications.title}</h1>
      <p class="mt-4 max-w-none hyphens-auto text-justify text-[15px] leading-7 text-black/58 sm:text-[16px] 2xl:text-[17px] 2xl:leading-8">{pageCopy.certifications.subtitle}</p>
    </header>

    {#each certificationGroups as group}
      <section id={certificationGroupId(group.group)} class="scroll-mt-28 border-b border-black/10 py-8 sm:py-9">
        <div class="flex items-start justify-between gap-4 sm:items-baseline sm:gap-6">
          <h2 class="text-[24px] font-semibold tracking-[-0.03em] sm:text-[28px]">{group.group}</h2>
          <span class="shrink-0 pt-1 text-[12px] text-black/58 sm:pt-0 sm:text-[13px]">{group.items.length}</span>
        </div>

        <div class="mt-6 grid gap-x-6 gap-y-9 sm:mt-7 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-3 2xl:grid-cols-4 2xl:gap-x-10 2xl:gap-y-12">
          {#each group.items as cert}
            <article id={certificationId(cert)} class="scroll-mt-28">
              <div class="aspect-[1.78] overflow-hidden rounded-lg border border-black/16 bg-[var(--surface)]">
                <MediaImage
                  className="h-full w-full"
                  src={cert.image}
                  srcset={responsiveCertificationSrcset(cert.image)}
                  sizes="(min-width: 1536px) 320px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, calc(100vw - 3rem)"
                  alt={cert.title}
                  fit="contain"
                />
              </div>
              <h3 class="mt-4 text-[16px] font-semibold leading-6">{cert.title}</h3>
              <p class="mt-1 text-[13px] text-black/58">{cert.issuer}</p>
              {#if cert.year || cert.credentialId}
                <p class="mt-1 break-words text-[12px] leading-5 text-black/58">
                  {cert.year}{#if cert.year && cert.credentialId} · {/if}{#if cert.credentialId}Credential ID: {cert.credentialId}{/if}
                </p>
              {/if}
              {#if cert.image}<a href={`#${certificationId(cert)}`} on:click={(event) => openCredential(event, cert)} class="mt-2 inline-flex min-h-10 items-center text-[12px] text-black/72 underline decoration-black/25 underline-offset-4 hover:text-black sm:mt-3">View credential →</a>{/if}
            </article>
          {/each}
        </div>
      </section>
    {/each}
  </PageShell>
</main>

<CredentialViewer bind:this={viewer} on:close={closeCredential}/>
