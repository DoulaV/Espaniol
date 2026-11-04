/* Wires the sync engine to the app: local storage, the chosen remote, and the status pill. */
import {createSync} from './sync.js';
import {localAdapter} from './localAdapter.js';
import {remoteAdapter} from './config.js';
import {S, setState, normalize} from '../state.js';
import {renderAll} from '../render.js';
import {$} from '../helpers.js';

const LABELS = {ok: 'Synced', err: 'Saved here, sync failed', slow: 'Connecting', local: 'This device'};
function setSync(s) {
  const el = $('sync');
  el.dataset.s = s;
  el.querySelector('span').textContent = LABELS[s] || LABELS.local;
}

const sync = createSync({
  local: localAdapter,
  remote: remoteAdapter,
  normalize,
  getState: () => S,
  setState,
  onChange: renderAll,
  onStatus: setSync,
});

/** Save after any change to S. */
export const persist = sync.persist;
/** Read the saved copy and start syncing. */
export const initStorage = sync.start;
