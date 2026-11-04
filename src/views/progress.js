/* Progreso: total hours road, stats, weekly chart, phase card, Anki, monthly retest, settings and backup. */
import {PHASES, MILESTONES} from '../content.js';
import {$, esc, dkey, addDays, fmt, weekStart, monthKey, MONTHS} from '../helpers.js';
import {S, setState, blank, normalize, totalHours, streak, avgDaily} from '../state.js';
import {persist} from '../storage/index.js';
import {renderAll} from '../render.js';
import {burstFrom} from '../ui/bubbles.js';
import {toast} from '../ui/toast.js';

export function renderProg() {
  const H = totalHours();
  $('pHours').textContent = fmt(H);
  $('pPhase').textContent = 'Phase ' + (S.phase + 1) + ' · ' + PHASES[S.phase].name;
  $('pFill').style.width = Math.min(100, H / 1500 * 100) + '%';
  $('pMarks').innerHTML = MILESTONES.map(m => '<div class="mark' + (H >= m.h ? ' on' : '') + '" style="left:' + (m.h / 1500 * 100) + '%"><i></i><span class="num" style="font-size:12px">' + m.h.toLocaleString('en-US') + '</span><span>' + esc(m.t) + '</span></div>').join('');
  $('sStreak').textContent = streak();
  const ws = weekStart(new Date());
  let wm = 0; for (let i = 0; i < 7; i++) wm += (S.days[dkey(addDays(ws, i))] || {}).l || 0;
  $('sWeek').textContent = fmt(wm / 60);
  const avg = avgDaily(28);
  $('sAvg').textContent = Math.round(avg);

  // weekly chart
  const weeks = [];
  for (let i = 11; i >= 0; i--) { const s = addDays(ws, -7 * i); let m = 0; for (let j = 0; j < 7; j++) m += (S.days[dkey(addDays(s, j))] || {}).l || 0; weeks.push({s, h: m / 60}); }
  const maxH = Math.max(7, Math.ceil(Math.max(...weeks.map(w => w.h)) / 7) * 7);
  const L = 34, R = 510, T = 14, B = 160, bw = (R - L) / 12;
  let svg = '';
  [0, maxH / 2, maxH].forEach(v => { const y = B - (v / maxH) * (B - T); svg += '<line class="grid" x1="' + L + '" x2="' + R + '" y1="' + y + '" y2="' + y + '"/><text x="' + (L - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + fmt(v) + '</text>'; });
  weeks.forEach((w, i) => {
    const x = L + i * bw + bw * .18, bh = Math.max(w.h > 0 ? 3 : 0, (w.h / maxH) * (B - T)), cur = i === 11;
    svg += '<rect x="' + x + '" y="' + (B - bh) + '" width="' + (bw * .64) + '" height="' + bh + '" rx="6" fill="' + (cur ? 'url(#g1)' : 'var(--sky)') + '" fill-opacity="' + (cur ? 1 : .55) + '"><title>Week of ' + MONTHS[w.s.getMonth()] + ' ' + w.s.getDate() + ': ' + fmt(w.h) + ' h</title></rect>';
    if (i % 3 === 0 || cur) svg += '<text x="' + (x + bw * .32) + '" y="' + (B + 18) + '" text-anchor="middle">' + (cur ? 'This wk' : MONTHS[w.s.getMonth()] + ' ' + w.s.getDate()) + '</text>';
  });
  $('weekChart').innerHTML = svg;
  const next = MILESTONES.find(m => m.h > H);
  if (!next) $('eta').textContent = 'You reached 1,500 hours.';
  else if (avg < 1) $('eta').textContent = 'Log a few days and you will see when you reach "' + next.t + '".';
  else {
    const days = (next.h - H) * 60 / avg, dt = addDays(new Date(), Math.ceil(days)), goal = addDays(new Date(), Math.ceil((1500 - H) * 60 / avg));
    $('eta').textContent = 'At ' + Math.round(avg) + ' min a day: ' + next.h.toLocaleString('en-US') + ' hours by ' + dt.toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}) + ', the full goal by ' + goal.toLocaleDateString('en-GB', {month: 'short', year: 'numeric'}) + '.';
  }

  // phase card
  const ph = PHASES[S.phase], nx = PHASES[S.phase + 1];
  $('phaseCard').innerHTML = '<div class="row between wrap"><div><div class="hello">Current phase</div><h2 style="font-size:22px;margin-top:2px">' + (S.phase + 1) + '. ' + esc(ph.name) + '</h2><div class="sub">' + ph.from.toLocaleString('en-US') + ' to ' + ph.to.toLocaleString('en-US') + ' hours</div></div></div>' +
    (nx ? '<p style="margin:14px 0 4px;font-size:15px"><strong>Move on when:</strong> ' + esc(ph.gate) + '</p>' : '<p style="margin:14px 0 4px;font-size:15px">' + esc(ph.gate) + '</p>') +
    '<div class="row wrap" style="margin-top:12px">' + (nx ? '<button class="btn primary sm" id="phaseNext">I\'m ready for ' + esc(nx.name) + '</button>' : '') + (S.phase > 0 ? '<button class="btn ghost sm" id="phasePrev">Go back a phase</button>' : '') + '</div>';
  const pn = $('phaseNext');
  if (pn) pn.onclick = e => { S.phase = Math.min(4, S.phase + 1); persist(); burstFrom(e.currentTarget, 30); toast('Phase ' + (S.phase + 1) + ' · ' + PHASES[S.phase].name); renderAll(); };
  const pp = $('phasePrev');
  if (pp) pp.onclick = () => { S.phase = Math.max(0, S.phase - 1); persist(); renderAll(); };

  // anki
  $('ankiVal').textContent = S.anki.toLocaleString('en-US');
  $('ankiFill').style.width = Math.min(100, S.anki / 1500 * 100) + '%';

  // retest
  if (document.activeElement !== $('clipUrl')) $('clipUrl').value = S.clip || '';
  const ok = /^https?:\/\//i.test(S.clip || '');
  $('clipOpen').href = ok ? S.clip : '#';
  $('clipOpen').hidden = !ok;
  const mk = monthKey();
  if (S.retests[mk] !== undefined && document.activeElement !== $('retestScore')) { $('retestScore').value = S.retests[mk]; $('retestLbl').textContent = S.retests[mk] + '%'; }
  const keys = Object.keys(S.retests).sort().slice(-12);
  let rs = '';
  const rL = 34, rR = 505, rT = 14, rB = 108;
  [0, 50, 100].forEach(v => { const y = rB - (v / 100) * (rB - rT); rs += '<line class="grid" x1="' + rL + '" x2="' + rR + '" y1="' + y + '" y2="' + y + '"/><text x="' + (rL - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + v + '%</text>'; });
  if (!keys.length) rs += '<text x="' + ((rL + rR) / 2) + '" y="' + ((rT + rB) / 2 + 4) + '" text-anchor="middle">Your first score will appear here</text>';
  else {
    const step = keys.length > 1 ? (rR - rL - 20) / (keys.length - 1) : 0;
    const pts = keys.map((k, i) => [rL + 10 + i * step, rB - (S.retests[k] / 100) * (rB - rT), k]);
    if (pts.length > 1) rs += '<polyline points="' + pts.map(p => p[0] + ',' + p[1]).join(' ') + '" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    pts.forEach((p, i) => {
      rs += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (i === pts.length - 1 ? 6 : 4) + '" fill="var(--accent)" stroke="var(--bg)" stroke-width="2"><title>' + p[2] + ': ' + S.retests[p[2]] + '%</title></circle>';
      rs += '<text x="' + p[0] + '" y="' + (rB + 20) + '" text-anchor="middle">' + MONTHS[+p[2].slice(5) - 1] + '</text>';
    });
  }
  $('retestChart').innerHTML = rs;
  if (document.activeElement !== $('startHours')) $('startHours').value = S.startHours;
}

export function initProgress() {
  $('ankiPlus').onclick = e => { S.anki += 50; persist(); if (S.anki % 500 === 0) burstFrom(e.currentTarget, 18); renderProg(); };
  $('ankiMinus').onclick = () => { S.anki = Math.max(0, S.anki - 50); persist(); renderProg(); };
  $('retestScore').oninput = e => { $('retestLbl').textContent = e.target.value + '%'; };
  $('retestSave').onclick = e => { S.retests[monthKey()] = +$('retestScore').value; persist(); burstFrom(e.currentTarget, 20); toast('Saved for this month'); renderAll(); };
  let clipT;
  $('clipUrl').oninput = e => { clearTimeout(clipT); clipT = setTimeout(() => { S.clip = e.target.value.trim(); persist(); renderProg(); }, 500); };
  $('startHours').onchange = e => { S.startHours = Math.max(0, +e.target.value || 0); persist(); renderAll(); };
  $('exportBtn').onclick = () => {
    const txt = JSON.stringify(S);
    const done = () => toast('Backup copied');
    const fallback = () => { $('importBox').hidden = false; $('importText').value = txt; $('importText').select(); };
    try { navigator.clipboard.writeText(txt).then(done, () => { fallback(); toast('Select all and copy'); }); } catch (e) { fallback(); }
  };
  $('importToggle').onclick = () => { $('importBox').hidden = !$('importBox').hidden; };
  $('importApply').onclick = () => {
    try { setState(normalize(JSON.parse($('importText').value))); persist(); $('importBox').hidden = true; toast('Backup restored'); renderAll(); }
    catch (e) { toast('That backup could not be read'); }
  };
  $('resetBtn').onclick = () => { $('resetYes').hidden = !$('resetYes').hidden; };
  $('resetYes').onclick = () => { setState(blank()); persist(); $('resetYes').hidden = true; toast('Progress erased'); renderAll(); };
}
