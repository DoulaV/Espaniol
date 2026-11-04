/* Wires the sync engine to the app: local storage, the chosen remote, and the status pill. */
import {createSync} from './sync.js';
import {localAdapter} from './localAdapter.js';
import {makeRemoteAdapter, readSyncSettings, writeSyncSettings} from './config.js';
import {S, setState, normalize} from '../state.js';
import {renderAll} from '../render.js';
import {$} from '../helpers.js';

const LABELS = {ok: 'Synced', err: 'Saved here, sync failed', slow: 'Connecting', local: 'This device'};
const statusListeners = [];
function setSync(s) {
  const el = $('sync');
  el.dataset.s = s;
  el.querySelector('span').textContent = LABELS[s] || LABELS.local;
  statusListeners.forEach(fn => fn(s));
}
export function onSyncStatus(fn) { statusListeners.push(fn); }

const sync = createSync({
  local: localAdapter,
  remote: makeRemoteAdapter(),
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
/** Pull the latest copy from the remote now. */
export const syncNow = sync.refresh;

export const isSyncOn = () => !!(readSyncSettings() || {}).token;

/** Turn on GitHub sync with a token. Rejects (and stays off) if GitHub refuses it. */
export async function connectSync(token) {
  const settings = {token};
  writeSyncSettings(settings);
  try { await sync.useRemote(makeRemoteAdapter(settings)); }
  catch (e) { writeSyncSettings(null); await sync.useRemote(null); throw e; }
}
/** Turn sync off on this device. Data stays here and in the gist. */
export async function disconnectSync() {
  writeSyncSettings(null);
  await sync.useRemote(null);
}
