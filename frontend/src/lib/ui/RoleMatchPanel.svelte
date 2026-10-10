<script lang="ts">
  import { onDestroy } from 'svelte';
  let jobDescription = '';
  let preparing = false;
  let error = '';
  let status = '';
  let coverage: number | null = null;
  let reportUrl = '';
  let controller: AbortController | null = null;

  function clearReport() {
    if (reportUrl) URL.revokeObjectURL(reportUrl);
    reportUrl = '';
    coverage = null;
    error = '';
    status = '';
  }

  async function prepareReport() {
    if (preparing || jobDescription.trim().length < 80) return;
    clearReport();
    preparing = true;
    controller = new AbortController();
    const timeout = setTimeout(() => controller?.abort(), 185000);
    try {
      const response = await fetch('/api/role-match/report', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription: jobDescription.trim() }), signal: controller.signal
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(typeof payload.error === 'string' ? payload.error : 'The report could not be prepared. Please try again.');
      }
      const blob = await response.blob();
      if (blob.type !== 'application/pdf' || blob.size < 5000 || await blob.slice(0, 4).text() !== '%PDF') throw new Error('The PDF could not be verified. Please try again.');
      const scoreHeader = response.headers.get('X-Role-Match-Score');
      const score = Number(scoreHeader);
      if (scoreHeader === null || !Number.isFinite(score) || score < 0 || score > 100) throw new Error('The report score could not be verified.');
      coverage = score;
      reportUrl = URL.createObjectURL(blob);
      status = 'Your role match report is ready.';
    } catch (cause) {
      if (controller?.signal.aborted) status = 'Analysis stopped. You can try again.';
      else error = cause instanceof Error ? cause.message : 'Couldn’t prepare the report. Please try again.';
    } finally {
      clearTimeout(timeout);
      preparing = false;
      controller = null;
    }
  }

  onDestroy(() => {
    controller?.abort();
    if (reportUrl) URL.revokeObjectURL(reportUrl);
  });
</script>

<section id="role-match" class="scroll-mt-28 border-b border-black/14 py-8 sm:py-9" aria-labelledby="role-match-title">
  <h2 id="role-match-title" class="text-[23px] font-semibold tracking-[-0.018em] sm:text-[25px]">Match a role</h2>
  <p class="mt-3 max-w-[65ch] text-[14px] leading-6 text-black/62">Compare a job description with my full portfolio. Get a PDF with matching experience, supporting sources, gaps, and questions to verify.</p>
  <form class="mt-5 space-y-3" on:submit|preventDefault={() => void prepareReport()}>
    <label for="role-job-description" class="block text-[13px] font-medium">Job description</label>
    <textarea id="role-job-description" class="min-h-48 w-full resize-y rounded-sm border border-black/20 bg-transparent p-3 text-[14px] leading-6 focus:outline-2 focus:outline-[var(--accent)]" rows="8" minlength="80" maxlength="12000" required disabled={preparing} bind:value={jobDescription} on:input={clearReport} placeholder="Paste the responsibilities, required skills, experience, and preferred qualifications." aria-describedby="role-match-help"></textarea>
    <p id="role-match-help" class="text-[12px] leading-5 text-black/58">The description is sent to an AI service for this comparison. The score measures documented evidence, not hiring probability. Your CV stays the same.</p>
    <div class="flex flex-wrap items-center gap-4">
      <button class="min-h-11 rounded-sm bg-[var(--accent)] px-5 text-[13px] font-medium text-white disabled:cursor-wait disabled:opacity-55" type="submit" disabled={preparing || jobDescription.trim().length < 80}>{preparing ? 'Comparing portfolio…' : 'Prepare role match report'}</button>
      {#if preparing}<button class="min-h-11 px-2 text-[13px] underline" type="button" on:click={() => controller?.abort()}>Cancel</button>{/if}
      <span class="text-[12px] text-black/58">{jobDescription.length.toLocaleString()} / 12,000 characters</span>
    </div>
  </form>
  {#if preparing}<p class="mt-4 text-[13px] leading-6 text-black/62" role="status" aria-live="polite">Reading the requirements and comparing portfolio evidence. The report can take a few minutes.</p>{/if}
  {#if error}<p class="mt-4 text-[13px] leading-6 text-[var(--accent)]" role="alert">{error}</p>{/if}
  {#if status}<p class="mt-4 text-[13px] leading-6" role="status" aria-live="polite">{status}</p>{/if}
  {#if reportUrl}
    <div class="mt-4 flex flex-wrap items-center gap-5 border border-black/14 p-4">
      <div><p class="text-[27px] font-semibold">{coverage}%</p><p class="text-[12px] text-black/58">Portfolio evidence coverage</p></div>
      <a class="min-h-11 content-center text-[13px] font-medium underline hover:text-[var(--accent)]" href={reportUrl} download="Faris_Munir_Mahdi_Role_Match.pdf">Download match report PDF</a>
    </div>
  {/if}
</section>
