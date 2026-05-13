<script lang="ts">
  import { onDestroy, onMount } from 'svelte';

  let x = $state(-100);
  let y = $state(-100);
  let visible = $state(false);
  let onPointer = $state(true);
  let idle = $state(false);
  // Start disabled so server-side render emits nothing; client onMount
  // enables based on (hover) and (prefers-reduced-motion) media queries.
  let enabled = $state(false);

  const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, summary';
  let idleTimer: ReturnType<typeof setTimeout> | undefined;

  function move(e: PointerEvent) {
    if (!enabled) return;
    x = e.clientX;
    y = e.clientY;
    visible = true;
    const target = e.target as Element | null;
    onPointer = !!target?.closest(INTERACTIVE);
    idle = false;
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { idle = true; }, 800);
  }
  function leave() {
    visible = false;
    idle = false;
    clearTimeout(idleTimer);
  }

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
    clearTimeout(idleTimer);
    document.documentElement.classList.remove('darkroom-cursor');
  });
</script>

{#if enabled}
  <div
    class="reticle"
    class:on={visible}
    class:hot={onPointer}
    class:idle
    style="transform: translate({x - 18}px, {y - 18}px);"
    aria-hidden="true"
  >
    <div class="inner">
      <span class="h"></span>
      <span class="v"></span>
      <span class="c"></span>
    </div>
  </div>
{/if}

<style>
  .reticle {
    position: fixed;
    top: 0;
    left: 0;
    width: 36px;
    height: 36px;
    pointer-events: none;
    z-index: 100;
    opacity: 0;
    transition: opacity 120ms linear;
    will-change: transform;
    --reticle-color: #ff3b30;
    --reticle-stroke: 1px;
  }
  .reticle.on {
    opacity: 1;
  }
  .reticle.hot {
    --reticle-color: #d4ff3a;
    --reticle-stroke: 2px;
  }

  .inner {
    position: absolute;
    inset: 0;
    transition:
      transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1),
      filter 180ms linear;
    will-change: transform;
  }
  .reticle.hot .inner {
    transform: rotate(45deg) scale(1.15);
  }
  .reticle.idle .inner {
    animation: reticlePulse 2s ease-in-out infinite;
  }
  .reticle.hot.idle .inner {
    animation: reticlePulseHot 2s ease-in-out infinite;
  }

  .h,
  .v,
  .c {
    transition:
      background-color 180ms linear,
      border-color 180ms linear,
      height 180ms linear,
      width 180ms linear,
      top 180ms linear,
      left 180ms linear,
      border-width 180ms linear;
  }
  .h {
    position: absolute;
    top: calc(18px - var(--reticle-stroke) / 2);
    left: 0;
    right: 0;
    height: var(--reticle-stroke);
    background: var(--reticle-color);
  }
  .v {
    position: absolute;
    left: calc(18px - var(--reticle-stroke) / 2);
    top: 0;
    bottom: 0;
    width: var(--reticle-stroke);
    background: var(--reticle-color);
  }
  .c {
    position: absolute;
    top: 16px;
    left: 16px;
    width: 4px;
    height: 4px;
    border: var(--reticle-stroke) solid var(--reticle-color);
    border-radius: 50%;
  }

  @keyframes reticlePulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(0.85); opacity: 0.55; }
  }
  @keyframes reticlePulseHot {
    0%, 100% { transform: rotate(45deg) scale(1.15); opacity: 1; }
    50%      { transform: rotate(45deg) scale(1);    opacity: 0.7; }
  }
</style>
