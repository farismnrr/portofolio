const MONTHS = new Map([
  ['jan', 0], ['january', 0],
  ['feb', 1], ['february', 1],
  ['mar', 2], ['march', 2],
  ['apr', 3], ['april', 3],
  ['may', 4],
  ['jun', 5], ['june', 5],
  ['jul', 6], ['july', 6],
  ['aug', 7], ['august', 7],
  ['sep', 8], ['sept', 8], ['september', 8],
  ['oct', 9], ['october', 9],
  ['nov', 10], ['november', 10],
  ['dec', 11], ['december', 11]
]);

function parseMonthYear(value) {
  const match = String(value).trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) throw new Error(`unsupported month/year value: ${value}`);
  const month = MONTHS.get(match[1].toLowerCase());
  if (month === undefined) throw new Error(`unsupported month name: ${match[1]}`);
  return Number(match[2]) * 12 + month;
}

export function currentMonthKey(now = new Date()) {
  return now.getUTCFullYear() * 12 + now.getUTCMonth();
}

export function parseExperiencePeriod(value, now = new Date()) {
  const parts = String(value).trim().split(/\s+[—–-]\s+/);
  if (parts.length !== 2) throw new Error(`unsupported experience period: ${value}`);

  const start = parseMonthYear(parts[0]);
  const isPresent = /^present$/i.test(parts[1].trim());
  const end = isPresent ? currentMonthKey(now) : parseMonthYear(parts[1]);
  if (end < start) throw new Error(`experience period ends before it starts: ${value}`);

  return { start, end, isPresent };
}

export function durationMonths(period) {
  return period.end - period.start + 1;
}

export function coveredMonths(periods) {
  if (!periods.length) return 0;
  const sorted = periods
    .map(({ start, end }) => ({ start, end }))
    .sort((a, b) => a.start - b.start || a.end - b.end);

  let total = 0;
  let current = { ...sorted[0] };
  for (const period of sorted.slice(1)) {
    if (period.start > current.end + 1) {
      total += durationMonths(current);
      current = { ...period };
    } else {
      current.end = Math.max(current.end, period.end);
    }
  }
  total += durationMonths(current);
  return total;
}

export function formatMonthKey(key) {
  const year = Math.floor(key / 12);
  const month = (key % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}
