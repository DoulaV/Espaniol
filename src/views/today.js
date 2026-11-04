/* Hoy: greeting, today's ring, hours, nudges and the routine for the current phase. */
import {PHASES, MILESTONES} from '../content.js';
import {$, esc, dkey, today, addDays, fmt, monthKey} from '../helpers.js';
import {S, totalHours, dayTotal, hoursPhase} from '../state.js';
import {ARROW} from './icons.js';

export function renderHoy() {
  const h = new Date().getHours();
  $('greet').textContent = h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
  const tm = dayTotal(today());
  $('todayMin').textContent = Math.round(tm);
  $('todayArc').style.strokeDashoffset = String(314.16 * (1 - Math.min(1, tm / 60)));
  const H = totalHours(), ph = PHASES[S.phase];
  $('phasePill').textContent = 'Phase ' + (S.phase + 1) + ' · ' + ph.name;
  $('heroHours').textContent = fmt(H);
  const next = MILESTONES.find(m => m.h > H);
  $('heroNext').textContent = next ? fmt(Math.max(0, next.h - H)) + ' hours to "' + next.t + '"' : 'Goal reached. Keep watching for fun.';
  $('blocks').innerHTML = ph.blocks.map(b =>
    '<div class="glass block ' + b.k + '"><div class="mins"><span class="num">' + b.d + '</span><small>min</small></div>' +
    '<div><div class="src">' + esc(b.src) + '</div><h3>' + esc(b.t) + '</h3><p>' + esc(b.how) + '</p></div>' +
    '<a class="open" href="' + b.url + '" target="_blank" rel="noopener" aria-label="Open ' + esc(b.src) + '">' + ARROW + '</a></div>').join('');

  // nudges
  const n = [];
  const yk = dkey(addDays(new Date(), -1));
  const anyHistory = Object.keys(S.days).some(k => k < today() && dayTotal(k) > 0);
  if (anyHistory && dayTotal(yk) <= 0 && dayTotal(today()) <= 0) n.push({c: '', t: 'You missed yesterday', p: 'Never miss twice. A 15-minute short day today keeps you on track.'});
  const hp = hoursPhase(H);
  if (hp > S.phase) n.push({c: 'good', t: 'You reached ' + PHASES[hp].from + ' hours', p: 'Check yourself: ' + ph.gate + ' If yes, move to the next phase in Progreso.'});
  if (new Date().getDate() <= 3 && S.retests[monthKey()] === undefined && anyHistory) n.push({c: 'good', t: 'Monthly retest', p: 'Rewatch your test clip and rate how much you caught. It is in Progreso.'});
  $('nudges').innerHTML = n.map(x => '<div class="glass nudge ' + x.c + '"><span class="dot"></span><div><strong>' + esc(x.t) + '</strong><p>' + esc(x.p) + '</p></div></div>').join('');
  $('nudges').hidden = !n.length;
}
