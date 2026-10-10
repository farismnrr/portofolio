import assert from 'node:assert/strict';
import {
  coveredMonths,
  durationMonths,
  formatMonthKey,
  parseExperiencePeriod
} from './lib/experience-duration.mjs';

const now = new Date('2026-10-10T00:00:00Z');
const currentEmployment = parseExperiencePeriod('July 2025 — Present', now);
assert.equal(durationMonths(currentEmployment), 16);
assert.equal(formatMonthKey(currentEmployment.end), '2026-10');

const dbs = parseExperiencePeriod('Feb 2025 — July 2025', now);
assert.equal(durationMonths(dbs), 6);
assert.equal(coveredMonths([dbs, currentEmployment]), 21, 'overlapping July 2025 must count once');

const bangkit = parseExperiencePeriod('Aug 2023 — Jan 2024', now);
const ruangguru = parseExperiencePeriod('Feb 2024 — Jun 2024', now);
const codepolitan = parseExperiencePeriod('Sep 2024 — Dec 2024', now);
const tradeasia = parseExperiencePeriod('Jan 2024 — Mar 2024', now);
assert.equal(coveredMonths([bangkit, ruangguru, codepolitan, dbs]), 21);
assert.equal(coveredMonths([tradeasia, currentEmployment]), 19);
assert.equal(
  coveredMonths([bangkit, ruangguru, codepolitan, dbs, tradeasia, currentEmployment]),
  36,
  'combined dated history must remove overlaps instead of summing records blindly'
);

assert.throws(() => parseExperiencePeriod('2025 — Present', now));
assert.throws(() => parseExperiencePeriod('Dec 2025 — Jan 2025', now));

process.stdout.write('Experience duration checks passed.\n');
