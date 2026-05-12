<script lang="ts">
  /**
   * ReticleCursor — a fixed 36x36 red crosshair that follows the pointer.
   *
   * Disabled on touch devices and when prefers-reduced-motion is set.
   * Hidden when the pointer is over an interactive element (the default
   * cursor takes over so users know they can click). Mount once at the
   * layout level with `client:idle`.
   */
  import { onDestroy, onMount } from 'svelte';

  let x = -100;
  let y = -100;
  let visible = false;
  let onPointer = true;

  let enabled = true;
  const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, summary';

  function move(e: PointerEvent) {
    if (!enabled) return;
    x = e.clientX;
    y = e.clientY;
    visible = true;

    const target = e.target as Element | null;
    onPointer = !!target?.closest(INTERACTIVE);
  }
  function leave() { visible = false; }

  onMount(() => {
    const mq1 = window.matchMedia('(hover: none)');
    const mq2 = window.matchMedia('(prefers-reduced-motion: reduce)');
    enabled = !mq1.matches && !mq2.matches;
    if (!enabled) return;

    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerleave', leave);
    document.documentElement.classList.add('darkroom-cursor');
  });
  onDestroy(() => {
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerleave', leave);
    document.documentElement.classList.remove('darkroom-cursor');
  });
</script>

{#if enabled}
  <div
    class="reticle"
    class:on={visible && !onPointer}
    style="transform: translate({x - 18}px, {y - 18}px);"
    aria-hidden="true"
  >
    <span class="h"></span>
    <span class="v"></span>
    <span class="c"></span>
  </div>
{/if}

<style>
  .reticle {
    position: fixed;
    top: 0; left: 0;
    width: 36px;
    height: 36px;
    pointer-events: none;
    z-index: 50;
    opacity: 0;
    transition: opacity 120ms linear;
    will-change: transform;
  }
  .reticle.on { opacity: 1; }
  .h { position: absolute; top: 17px; left: 0; right: 0; height: 1px; background: #ff3b30; }
  .v { position: absolute; left: 17px; top: 0; bottom: 0; width: 1px; background: #ff3b30; }
  .c { position: absolute; top: 16px; left: 16px; width: 4px; height: 4px; border: 1px solid #ff3b30; border-radius: 50%; }
</style>
