<script lang="ts">
  import AppIcon from './AppIcon.svelte';
  import BrandLogo from './BrandLogo.svelte';
  import { profile } from '../site-content';
  import PageShell from './PageShell.svelte';

  const year = new Date().getFullYear();
</script>

<footer class="border-t border-black/14 bg-[var(--page-bg)]">
  <PageShell>
    <div class="flex min-h-[88px] flex-col justify-center gap-4 py-5 text-[11px] text-black/60 sm:flex-row sm:items-center sm:justify-between sm:py-6">
      <div class="flex items-center gap-4 sm:gap-5">
        <BrandLogo className="h-[19px] w-[100px] shrink-0 sm:h-[20px] sm:w-[105px]"/>
        <span>{profile.role}</span>
      </div>
      <div class="flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-x-3">
        <a class="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/[0.05] hover:text-black" href={profile.github} aria-label="GitHub"><AppIcon name="github" size={15}/></a>
        <a class="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/[0.05] hover:text-black" href={profile.linkedin} aria-label="LinkedIn"><AppIcon name="linkedin" size={15}/></a>
        <a class="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-black/[0.05] hover:text-black" href={profile.email} aria-label={`Email ${profile.name}`} title={profile.email.replace(/^mailto:/, '')}><AppIcon name="mail" size={15}/></a>
        <span class="basis-full pt-1 sm:ml-1 sm:basis-auto sm:pt-0">© {year} {profile.name}</span>
      </div>
    </div>
  </PageShell>
</footer>
