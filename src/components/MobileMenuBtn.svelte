<script lang="ts">
  import ThemeToggleBtn from './ThemeToggleBtn.svelte';

  const navItems = ['home', 'about', 'work', 'blog', 'testimonials', 'contact'];

  let isOpen = $state(false);
</script>

<div class="lg:hidden w-9 h-9 rounded-full relative flex justify-center items-center bg-secondary cursor-pointer">
  {#if !isOpen}
    <button
      type="button"
      onclick={() => (isOpen = true)}
      aria-label="Open menu"
      class="w-full h-full flex justify-center items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        class="w-10 h-10 text-white"
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
      class="lg:hidden fixed top-0 bottom-0 right-0 z-50 p-4 w-4/5 h-screen flex justify-end items-end flex-col bg-gray-500/25 backdrop-blur-sm border border-white/18 transition-all duration-75 ease-in-out"
    >
      <button
        type="button"
        onclick={() => (isOpen = false)}
        aria-label="Close menu"
        class="w-9 h-9 rounded-full relative flex justify-center items-center bg-secondary cursor-pointer m-4"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-10 h-10 text-white"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
          ></path>
        </svg>
      </button>
      <div class="m-0 p-0 h-full w-full flex justify-start items-start flex-col">
        <ul>
          {#each navItems as item}
            <li class="m-4 flex justify-center items-center group">
              <a
                href={`#${item}`}
                class="text-secondary dark:text-white text-lg uppercase font-bold transition-all ease-in-out"
                onclick={() => (isOpen = false)}
              >
                {item}
              </a>
              <div
                class="ml-5 w-2 h-2 bg-transparent rounded-full mx-auto mb-1 group-hover:bg-white transition-all ease-in-out"
              ></div>
            </li>
          {/each}
        </ul>
        <ThemeToggleBtn />
      </div>
    </div>
  {/if}
</div>
