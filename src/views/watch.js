/* Ver: shows unlocked by hours, and your song list. */
import {SHOWS} from '../content.js';
import {$, esc} from '../helpers.js';
import {S, totalHours} from '../state.js';
import {persist} from '../storage/index.js';
import {burstFrom} from '../ui/bubbles.js';
import {toast} from '../ui/toast.js';

const ST = ['Not started', 'Watching', 'Done'];

export function renderVer() {
  const H = totalHours();
  $('showList').innerHTML = SHOWS.map(s => {
    const o = S.shows[s.id] || {st: 0, ep: 0};
    const lock = H < s.u && !o.st;
    return '<div class="li' + (lock ? ' locked' : '') + '"><div><h4>' + esc(s.t) + '</h4><p>' + esc(s.m) + ' · from ' + s.u.toLocaleString('en-US') + ' h' + (o.st === 1 ? ' · episode ' + (o.ep || 0) : '') + '</p></div><div class="row" style="gap:6px">' +
      (o.st === 1 ? '<button class="chip" data-ep="' + s.id + '" aria-label="Add an episode">+1 ep</button>' : '') +
      '<button class="chip" data-show="' + s.id + '" data-st="' + o.st + '">' + (lock ? 'Locked' : ST[o.st]) + '</button></div></div>';
  }).join('');
  $('songCount').textContent = S.songs.length ? S.songs.filter(s => s.st).length + ' of ' + S.songs.length + ' understood without lyrics' : '';
  $('songList').innerHTML = S.songs.length
    ? S.songs.map(s => '<div class="li"><div><h4>' + esc(s.t) + '</h4><p>' + esc(s.a || 'Unknown artist') + '</p></div><div class="row" style="gap:6px"><button class="chip" data-song="' + esc(s.id) + '" data-st="' + (s.st ? 2 : 1) + '">' + (s.st ? 'No lyrics needed' : 'With lyrics') + '</button><button class="chip" data-del="' + esc(s.id) + '" aria-label="Remove song">×</button></div></div>').join('')
    : '<p class="sub" style="margin:4px 0 6px">Add the Spanish songs you love. Mark each one when you can follow it without reading the lyrics.</p>';
}

export function initWatch() {
  $('showList').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.show) { const id = b.dataset.show, o = S.shows[id] || {st: 0, ep: 0}; o.st = (o.st + 1) % 3; S.shows[id] = o; persist(); if (o.st === 2) burstFrom(b, 24); renderVer(); }
    if (b.dataset.ep) { const o = S.shows[b.dataset.ep]; o.ep = (o.ep || 0) + 1; persist(); renderVer(); }
  });
  $('songList').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.song) { const s = S.songs.find(x => x.id === b.dataset.song); if (s) { s.st = !s.st; persist(); if (s.st) { burstFrom(b, 24); toast('¡Bien! Understood without lyrics'); } renderVer(); } }
    if (b.dataset.del) { S.songs = S.songs.filter(x => x.id !== b.dataset.del); persist(); renderVer(); }
  });
  $('songForm').addEventListener('submit', e => {
    e.preventDefault();
    const t = $('songTitle').value.trim(); if (!t) return;
    S.songs.unshift({id: 's' + Date.now().toString(36), t: t.slice(0, 80), a: $('songArtist').value.trim().slice(0, 60), st: false});
    $('songTitle').value = ''; $('songArtist').value = '';
    persist(); renderVer();
  });
}
