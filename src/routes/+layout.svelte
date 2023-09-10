<script>
  import { browser } from "$app/environment";

  export const prerender = true;

</script>

{#if browser}
<slot/>
{/if}