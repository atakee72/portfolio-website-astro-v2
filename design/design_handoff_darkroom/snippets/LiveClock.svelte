<script lang="ts">
  /**
   * LiveClock — emits "DD.M.YY · HH:MM" in Roman-numeral month form, e.g.
   * 11.V.26 · 21:14. Mirrors the prototype's status-bar timestamp.
   * Updates every 60s on mount; pure browser, no SSR drift.
   */
  import { onDestroy, onMount } from 'svelte';

  /** Optional class passthrough so the parent controls color + spacing. */
  export let className: string | undefined = undefined;
  export { className as class };

  const ROMAN = ['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'];

  function now(): string {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = ROMAN[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day}.${month}.${year} · ${hh}:${mm}`;
  }

  let label = now();
  let interval: ReturnType<typeof setInterval>;

  onMount(() => {
    interval = setInterval(() => { label = now(); }, 60_000);
  });
  onDestroy(() => clearInterval(interval));
</script>

<span class={className}>{label}</span>
