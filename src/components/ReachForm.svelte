<script lang="ts">
  // Web3Forms access_key is per-form and explicitly public (security boundary is
  // the allowed-domains list at web3forms.com, not the key). Inlined here to
  // avoid env-var pipeline fragility — Vercel CLI 54.1 can't reliably store
  // newline-free values, and the SSR pass embedded a literal \n into the HTML.
  const accessKey = '7d9f19b1-e43e-46fb-95e8-b4cf91c59cc4';

  type Status = 'idle' | 'sending' | 'sent' | 'error';
  let status: Status = $state('idle');
  let errorMessage = $state('');

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (status === 'sending') return;

    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    // Honeypot: if filled, silently succeed.
    if (data.get('botcheck')) {
      status = 'sent';
      return;
    }

    status = 'sending';
    errorMessage = '';

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (res.ok && json.success) {
        status = 'sent';
        form.reset();
      } else {
        status = 'error';
        errorMessage = json.message ?? 'Submission failed';
      }
    } catch (err) {
      status = 'error';
      errorMessage = err instanceof Error ? err.message : 'Network error';
    }
  }
</script>

<form
  onsubmit={onSubmit}
  class="m-0 flex flex-col gap-3 font-mono text-[12px]"
>
  <input type="hidden" name="access_key" value={accessKey} />
  <input type="hidden" name="subject" value="Portfolio reach-out" />
  <input type="hidden" name="from_name" value="ercanatak.dev" />
  <input
    type="checkbox"
    name="botcheck"
    class="hidden"
    tabindex={-1}
    autocomplete="off"
  />

  <label for="reach-name" class="text-paper m-0">
    <span class="text-safelight">$</span> your name
  </label>
  <input
    id="reach-name"
    type="text"
    name="name"
    required
    autocomplete="name"
    class="bg-ink border border-ink-3 px-2 py-1.5 text-paper focus:border-phosphor outline-none"
  />

  <label for="reach-email" class="text-paper m-0">
    <span class="text-safelight">$</span> your email
  </label>
  <input
    id="reach-email"
    type="email"
    name="email"
    required
    autocomplete="email"
    class="bg-ink border border-ink-3 px-2 py-1.5 text-paper focus:border-phosphor outline-none"
  />

  <label for="reach-message" class="text-paper m-0">
    <span class="text-safelight">$</span> message
  </label>
  <textarea
    id="reach-message"
    name="message"
    required
    rows={8}
    class="bg-ink border border-ink-3 px-2 py-1.5 text-paper focus:border-phosphor outline-none resize-y"
  ></textarea>

  <button
    type="submit"
    disabled={status === 'sending'}
    class="self-start mt-1 border border-phosphor text-phosphor px-3 py-1.5 tracking-[0.12em] uppercase hover:bg-phosphor hover:text-ink transition-colors disabled:opacity-50"
  >
    {status === 'sending' ? 'sending…' : '$ send →'}
  </button>

  <div aria-live="polite" class="m-0">
    {#if status === 'sent'}
      <p class="text-phosphor mt-1 m-0">✓ message sent — i'll reply within 48h.</p>
    {:else if status === 'error'}
      <p class="text-yavru mt-1 m-0">! could not send: {errorMessage}</p>
    {/if}
  </div>
</form>
