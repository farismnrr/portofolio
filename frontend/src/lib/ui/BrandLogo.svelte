<script lang="ts">
  export let className = '';
  export let decorative = false;
</script>

<span class={"brand-logo " + className} aria-hidden={decorative ? 'true' : undefined}>
  <img class="brand-logo__light h-full w-full object-contain object-left" src="/images/brand/farismnrr-logo.svg" alt={decorative ? '' : 'farismnrr.'}/>
  <img class="brand-logo__dark h-full w-full object-contain object-left" src="/images/brand/farismnrr-logo-dark.svg" alt="" aria-hidden="true"/>
</span>
