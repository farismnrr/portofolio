<script lang="ts">
  import AppIcon from './AppIcon.svelte';
  import BrandLogo from './BrandLogo.svelte';
  import { profile } from '../structured-content';
  import PageShell from './PageShell.svelte';

  const year = new Date().getFullYear();
</script>

<footer class="border-t border-black/10 bg-[var(--page-bg)]">
  <PageShell>
    <div class="flex min-h-[88px] flex-col justify-center gap-4 py-6 text-[11px] text-black/48 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-5">
        <BrandLogo className="h-[20px] w-[105px] shrink-0"/>
        <span>{profile.role}</span>
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <a class="hover:text-black" href={profile.github} aria-label="GitHub"><AppIcon name="github" size={15}/></a>
        <a class="hover:text-black" href={profile.linkedin} aria-label="LinkedIn"><AppIcon name="linkedin" size={15}/></a>
        <a class="hover:text-black" href={profile.email}>Email</a>
        <span>© {year} {profile.name}</span>
      </div>
    </div>
  </PageShell>
</footer>
