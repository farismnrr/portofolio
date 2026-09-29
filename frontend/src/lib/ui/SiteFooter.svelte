<script lang="ts">
  import AppIcon from './AppIcon.svelte';
  import BrandLogo from './BrandLogo.svelte';
  import { navigation, profile } from '../structured-content';
  import { navigate } from '../router';
  import PageShell from './PageShell.svelte';

  const year = new Date().getFullYear();
</script>

<footer class="border-t border-black/10 bg-[var(--page-bg)]">
  <PageShell>
    <div class="grid min-h-[90px] items-center gap-6 py-6 text-[11px] text-black/48 lg:grid-cols-[1fr_auto_1fr]">
      <div class="flex items-center gap-6">
        <BrandLogo className="h-[20px] w-[105px] shrink-0"/>
        <span class="leading-4">{profile.name}<br/>{profile.role}</span>
      </div>
      <nav class="hidden items-center gap-5 lg:flex">
        {#each navigation as item}<a class="hover:text-black" href={item.href} on:click={(e)=>navigate(e,item.href)}>{item.label}</a>{/each}
      </nav>
      <div class="flex items-center gap-4 lg:justify-self-end">
        <a href={profile.github} aria-label="GitHub"><AppIcon name="github" size={15}/></a>
        <a href={profile.linkedin} aria-label="LinkedIn"><AppIcon name="linkedin" size={15}/></a>
        <span class="ml-2">© {year} {profile.name}.</span>
      </div>
    </div>
  </PageShell>
</footer>
