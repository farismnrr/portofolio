<script lang="ts">
  import { path } from './lib/router';
  import SiteHeader from './lib/ui/SiteHeader.svelte';
  import SiteFooter from './lib/ui/SiteFooter.svelte';
  import HomePage from './pages/HomePage.svelte';
  import AboutPage from './pages/AboutPage.svelte';
  import ExperiencePage from './pages/ExperiencePage.svelte';
  import SkillsPage from './pages/SkillsPage.svelte';
  import ProjectsPage from './pages/ProjectsPage.svelte';
  import ProjectDetailPage from './pages/ProjectDetailPage.svelte';
  import BlogPage from './pages/BlogPage.svelte';
  import ArticlePage from './pages/ArticlePage.svelte';
  import CertificationsPage from './pages/CertificationsPage.svelte';
  import GalleryPage from './pages/GalleryPage.svelte';

  $: current = $path;
  $: active = current.startsWith('/projects') ? '/projects'
    : current.startsWith('/blog') ? '/blog'
    : current.startsWith('/certifications') ? '/certifications'
    : current.startsWith('/gallery') ? '/gallery'
    : current.startsWith('/about') || current.startsWith('/experience') || current.startsWith('/skills') ? '/about'
    : '/';
</script>

<svelte:head><title>Alex Morgan — Software Engineer</title></svelte:head>
<SiteHeader currentPath={active}/>
{#if current === '/'}<HomePage/>
{:else if current === '/about'}<AboutPage/>
{:else if current === '/experience'}<ExperiencePage/>
{:else if current === '/skills'}<SkillsPage/>
{:else if current === '/projects'}<ProjectsPage/>
{:else if current.startsWith('/projects/')}<ProjectDetailPage/>
{:else if current === '/blog'}<BlogPage/>
{:else if current.startsWith('/blog/')}<ArticlePage/>
{:else if current === '/certifications'}<CertificationsPage/>
{:else if current === '/gallery'}<GalleryPage/>
{:else}<HomePage/>{/if}
<SiteFooter/>
