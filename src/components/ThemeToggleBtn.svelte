<script lang="ts">
  import { onMount } from 'svelte';

  let theme: 'light' | 'dark' = $state('light');

  onMount(() => {
    theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  });

  function toggleTheme() {
    const next: 'light' | 'dark' = theme === 'light' ? 'dark' : 'light';
    theme = next;
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }
</script>

<button
  type="button"
  class="container relative flex justify-between items-center mx-4 w-10 h-5 rounded-3xl cursor-pointer bg-gray-500"
  onclick={toggleTheme}
  aria-label="Toggle theme"
>
  <img src="/assets/moon.png" alt="moon" class="w-[14px] h-[14px]" />
  <div
    class="bg-white absolute w-4 h-4 rounded-3xl transition-all"
    class:left-0={theme === 'dark'}
    class:right-0={theme !== 'dark'}
  ></div>
  <img src="/assets/sun.png" alt="sun" class="w-[14px] h-[14px]" />
</button>
