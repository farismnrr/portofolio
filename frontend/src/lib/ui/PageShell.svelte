<script lang="ts">
  export let className = '';
</script>

<div class={"mx-auto w-full max-w-[2200px] px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 " + className}>
  <slot />
</div>
