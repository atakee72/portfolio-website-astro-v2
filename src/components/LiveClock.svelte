<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  let { class: className }: { class?: string } = $props();

  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  function now(): string {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = ROMAN[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} · ${hh}:${mm}`;
  }

  let label = $state(now());
  let interval: ReturnType<typeof setInterval>;

  onMount(() => {
    interval = setInterval(() => {
      label = now();
    }, 60_000);
  });
  onDestroy(() => clearInterval(interval));
</script>

<span class={className}>{label}</span>
