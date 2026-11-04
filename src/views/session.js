/* The live practice session: timed blocks, pause, skip, end. Survives a reload. */
import {PHASES, SHORT_BLOCK} from '../content.js';
import {$, pad} from '../helpers.js';
import {S, logMin} from '../state.js';
import {persist} from '../storage/index.js';
import {renderAll} from '../render.js';
import {burst, burstFrom} from '../ui/bubbles.js';
import {toast} from '../ui/toast.js';
import {chime} from '../ui/sound.js';
import {openSheet, closeSheet} from '../ui/sheets.js';
import {PLAY, PAUSE} from './icons.js';

const LS_SESSION = 'mi-espanol-session';
let sess = null, tickT = null, wake = null;

export const sessionActive = () => !!sess;

function saveSess() { try { sess ? localStorage.setItem(LS_SESSION, JSON.stringify(sess)) : localStorage.removeItem(LS_SESSION); } catch (e) { /* ignore */ } }
function sessBlocks() { return sess.short ? [SHORT_BLOCK] : PHASES[sess.phase].blocks; }
function elapsed() { return sess.acc + (sess.paused ? 0 : Date.now() - sess.t0); }
async function lockScreen() { try { if ('wakeLock' in navigator) wake = await navigator.wakeLock.request('screen'); } catch (e) { wake = null; } }

function startSession(short) {
  sess = {phase: S.phase, short: !!short, i: 0, t0: Date.now(), acc: 0, paused: false};
  saveSess(); openSheet('session'); lockScreen(); renderSess(); tickT = setInterval(tick, 250);
}
function commitBlock(ms) { const b = sessBlocks()[sess.i]; const min = Math.round(ms / 6000) / 10; if (min > 0) logMin(b.k, min); persist(); }
function advance(fromTimer) {
  const blocks = sessBlocks(); const b = blocks[sess.i];
  commitBlock(fromTimer ? b.d * 60000 : elapsed()); chime(); burstFrom($('sArc').closest('.s-ring'), fromTimer ? 26 : 12);
  sess.i++;
  if (sess.i >= blocks.length) { finish(true); return; }
  sess.t0 = Date.now(); sess.acc = 0; saveSess(); renderSess(); toast('Next: ' + blocks[sess.i].t);
}
function finish(complete) {
  clearInterval(tickT); tickT = null;
  const was = sess; sess = null; saveSess(); closeSheet('session');
  try { wake && wake.release(); } catch (e) { /* ignore */ }
  wake = null;
  if (complete) {
    burst(innerWidth / 2, innerHeight * .35, 60);
    setTimeout(() => burst(innerWidth * .25, innerHeight * .55, 30), 250);
    setTimeout(() => burst(innerWidth * .75, innerHeight * .5, 30), 450);
    toast(was.short ? 'Short day done. Streak kept.' : '¡Hecho! Hour complete.');
  }
  renderAll();
}
function tick() { if (!sess) return; const b = sessBlocks()[sess.i]; if (!sess.paused && elapsed() >= b.d * 60000) { advance(true); return; } renderTime(); }
function renderTime() {
  const b = sessBlocks()[sess.i]; const left = Math.max(0, b.d * 60000 - elapsed()); const s = Math.ceil(left / 1000);
  $('sTime').textContent = pad(Math.floor(s / 60)) + ':' + pad(s % 60);
  $('sArc').style.strokeDashoffset = String(326.73 * (left / (b.d * 60000)));
  $('sSteps').querySelectorAll('b').forEach((x, i) => { x.style.width = (i < sess.i ? 100 : i === sess.i ? Math.min(100, elapsed() / (b.d * 600)) : 0) + '%'; });
}
function renderSess() {
  const blocks = sessBlocks(), b = blocks[sess.i];
  $('sSteps').innerHTML = blocks.map(() => '<i><b></b></i>').join('');
  $('sKind').textContent = (b.k === 'listen' ? 'Listening' : 'Study') + ' · ' + (sess.i + 1) + ' of ' + blocks.length;
  $('sTitle').textContent = b.src; $('sHow').textContent = b.how; $('sOpen').href = b.url; $('sOpen').textContent = 'Open ' + b.src.split(' · ')[0];
  $('sLeft').textContent = sess.paused ? 'paused' : 'left in ' + b.t.toLowerCase();
  $('sPauseIco').innerHTML = sess.paused ? PLAY : PAUSE;
  $('sPause').setAttribute('aria-label', sess.paused ? 'Resume' : 'Pause');
  renderTime();
}

export function initSession() {
  $('startBtn').onclick = e => { burstFrom(e.currentTarget, 16); startSession(false); };
  $('shortBtn').onclick = e => { burstFrom(e.currentTarget, 10); startSession(true); };
  $('sPause').onclick = () => { if (!sess) return; if (sess.paused) { sess.t0 = Date.now(); sess.paused = false; lockScreen(); } else { sess.acc = elapsed(); sess.paused = true; } saveSess(); renderSess(); };
  $('sSkip').onclick = () => { if (sess) advance(false); };
  $('sEnd').onclick = () => { if (!sess) return; commitBlock(elapsed()); finish(false); toast('Session saved'); };
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && sess && !sess.paused) lockScreen(); });
  // resume an unfinished session after reload
  try {
    const raw = localStorage.getItem(LS_SESSION);
    if (raw) { const s = JSON.parse(raw); if (s && typeof s.i === 'number') { sess = s; openSheet('session'); renderSess(); tickT = setInterval(tick, 250); } }
  } catch (e) { /* ignore */ }
}
