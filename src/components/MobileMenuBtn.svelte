<script lang="ts">
  import ThemeToggleBtn from './ThemeToggleBtn.svelte';

  // Mirrors the hero navItems array in Header.astro.
  // Anchors per audit finding C in the redesign plan.
  const navItems: { label: string; href: string }[] = [
    { label: 'home', href: '#home' },
    { label: 'sheet', href: '#sheet' },
    { label: 'journal', href: '#blog' },
    { label: 'rolls', href: '#' },
    { label: 'paints', href: '#' },
    { label: 'reach', href: 'mailto:atakee@gmail.com' },
  ];

  let isOpen = $state(false);
</script>

<div class="lg:hidden relative">
  {#if !isOpen}
    <button
      type="button"
      onclick={() => (isOpen = true)}
      aria-label="Open menu"
      class="w-8 h-8 flex justify-center items-center border border-ink-3 bg-ink text-paper hover:text-phosphor transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="w-4 h-4"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 13a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
        ></path>
      </svg>
    </button>
  {:else}
    <div
      class="fixed inset-0 z-modal bg-ink-2 border border-ink-3 flex flex-col p-6 font-mono text-paper"
    >
      <div class="flex justify-between items-center mb-8">
        <span class="text-[10px] text-mute-2 tracking-[0.18em] uppercase">
          ~/menu
        </span>
        <button
          type="button"
          onclick={() => (isOpen = false)}
          aria-label="Close menu"
          class="w-8 h-8 flex justify-center items-center border border-ink-3 bg-ink text-paper hover:text-safelight transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-4 h-4"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            ></path>
          </svg>
        </button>
      </div>

      <ul class="flex-1 flex flex-col gap-3 list-none p-0 m-0">
        {#each navItems as item, i}
          <li class="flex items-baseline gap-3 text-[18px] tracking-[0.14em] uppercase">
            <span class="text-safelight text-[12px]">
              {String(i + 1).padStart(2, '0')}
            </span>
            <a
              href={item.href}
              class="text-paper hover:text-phosphor transition-colors"
              onclick={() => (isOpen = false)}
            >
              {item.label}
            </a>
          </li>
        {/each}
      </ul>

      <div class="mt-6 pt-4 border-t border-ink-3 flex justify-between items-center">
        <span class="text-[10px] text-mute-2 tracking-[0.16em]">THEME</span>
        <ThemeToggleBtn />
      </div>
    </div>
  {/if}
</div>
