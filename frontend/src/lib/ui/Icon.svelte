<script lang="ts">
  export let name: 'github' | 'linkedin' | 'sun' | 'mail' | 'map-pin' | 'globe' | 'file-text' | 'arrow-left';
  export let size = 18;
  export let strokeWidth = 1.8;
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width={strokeWidth}
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-hidden="true"
>
  {#if name === 'github'}
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.28-.36 6.72-1.61 6.72-7.25A5.65 5.65 0 0 0 19.22 3.3 5.3 5.3 0 0 0 19.08.3S17.9-.1 15 1.8a13.4 13.4 0 0 0-6 0C6.1-.1 4.92.3 4.92.3a5.3 5.3 0 0 0-.14 3A5.65 5.65 0 0 0 3.28 7.3c0 5.63 3.44 6.88 6.72 7.25A4.8 4.8 0 0 0 9 18v4"/>
    <path d="M9 19c-3 .9-3-1.5-4-2"/>
  {:else if name === 'linkedin'}
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  {:else if name === 'sun'}
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
  {:else if name === 'mail'}
    <rect x="3" y="5" width="18" height="14" rx="2"/>
    <path d="m3 7 9 6 9-6"/>
  {:else if name === 'map-pin'}
    <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/>
    <circle cx="12" cy="10" r="2.5"/>
  {:else if name === 'globe'}
    <circle cx="12" cy="12" r="9"/>
    <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>
  {:else if name === 'file-text'}
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2"/>
  {:else}
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  {/if}
</svg>
