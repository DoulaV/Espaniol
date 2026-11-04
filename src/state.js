/*
 * The tracker's data and the calculations made from it.
 * `S` is a live binding: other modules read it directly and see replacements
 * made through setState(). Mutate fields on S, then call persist() from storage.
 */
import {PHASES} from './content.js';
import {dkey, today, addDays} from './helpers.js';

export const blank = () => ({v:1, startHours:0, phase:0, days:{}, anki:0, clip:'', retests:{}, shows:{}, songs:[], updated:0});

/** Turn anything (old backup, remote doc, junk) into a valid state object. */
export function normalize(d) {
  const b = blank();
  if (!d || typeof d !== 'object') return b;
  for (const k in b) { if (d[k] !== undefined) b[k] = d[k]; }
  if (typeof b.days !== 'object' || Array.isArray(b.days)) b.days = {};
  if (!Array.isArray(b.songs)) b.songs = [];
  if (typeof b.shows !== 'object') b.shows = {};
  if (typeof b.retests !== 'object') b.retests = {};
  b.phase = Math.max(0, Math.min(4, b.phase | 0));
  b.startHours = Math.max(0, +b.startHours || 0);
  b.anki = Math.max(0, +b.anki || 0);
  return b;
}

export let S = blank();
export function setState(next) { S = next; }

export function logMin(kind, min, day) {
  if (!(min > 0)) return;
  const k = day || today();
  const d = S.days[k] || {l:0, s:0};
  if (kind === 'listen') d.l = Math.round((d.l + min) * 10) / 10; else d.s = Math.round((d.s + min) * 10) / 10;
  S.days[k] = d;
}
export function listenMin() { let m = 0; for (const k in S.days) m += S.days[k].l || 0; return m; }
export function totalHours() { return S.startHours + listenMin() / 60; }
export function dayTotal(k) { const d = S.days[k]; return d ? (d.l || 0) + (d.s || 0) : 0; }
export function hoursPhase(h) { let p = 0; PHASES.forEach((ph, i) => { if (h >= ph.from) p = i; }); return p; }
export function streak() {
  let n = 0, d = new Date();
  if (dayTotal(dkey(d)) <= 0) d = addDays(d, -1);
  while (dayTotal(dkey(d)) > 0) { n++; d = addDays(d, -1); }
  return n;
}
export function avgDaily(days) {
  let m = 0;
  for (let i = 1; i <= days; i++) m += (S.days[dkey(addDays(new Date(), -i))] || {}).l || 0;
  m += ((S.days[today()] || {}).l || 0);
  return m / days;
}
