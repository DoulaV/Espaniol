/* "+ Log listening" sheet: quick chips for minutes, source and day. */
import {$, dkey, today, addDays} from '../helpers.js';
import {logMin} from '../state.js';
import {persist} from '../storage/index.js';
import {renderAll} from '../render.js';
import {burst} from '../ui/bubbles.js';
import {toast} from '../ui/toast.js';
import {openSheet, closeSheet} from '../ui/sheets.js';

const logState = {m: 30, src: 'Show', day: 0};
const MINS = [10, 15, 30, 45, 60, 90], SRCS = ['Show', 'Podcast', 'Dreaming Spanish', 'Music', 'Other'], DAYS = ['Today', 'Yesterday'];

function chips(id, arr, key, lab) {
  $(id).innerHTML = arr.map((v, i) => { const val = key === 'day' ? i : v; return '<button type="button" class="chip" aria-pressed="' + (logState[key] === val) + '" data-k="' + key + '" data-v="' + val + '">' + (lab ? lab(v) : v) + '</button>'; }).join('');
}
function renderLog() { chips('logMins', MINS, 'm', v => v + ' min'); chips('logSrc', SRCS, 'src'); chips('logDay', DAYS, 'day'); $('logSum').textContent = logState.m + ' min'; }

export function initLogSheet() {
  $('logForm').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k; logState[k] = k === 'src' ? b.dataset.v : +b.dataset.v; renderLog(); });
  $('logBtn').onclick = () => { renderLog(); openSheet('logSheet'); };
  $('logCancel').onclick = () => closeSheet('logSheet');
  $('logSheet').addEventListener('click', e => { if (e.target.id === 'logSheet') closeSheet('logSheet'); });
  $('logForm').addEventListener('submit', e => {
    e.preventDefault();
    const day = logState.day ? dkey(addDays(new Date(), -1)) : today();
    logMin('listen', logState.m, day); persist(); closeSheet('logSheet');
    burst(innerWidth / 2, innerHeight * .3, 26);
    toast('+' + logState.m + ' min of ' + logState.src);
    renderAll();
  });
}
