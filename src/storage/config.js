/*
 * Choose where data is synced. Returning null means this device only.
 *
 * Right now: a private GitHub gist, switched on from Progreso > Sync across
 * devices. To use a different service, write an adapter (see
 * adapters/template.js) and return it here instead.
 */
import {createGistAdapter} from './adapters/gist.js';

const KEY = 'mi-espanol-gist';

export function readSyncSettings() {
  try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch (e) { return null; }
}
export function writeSyncSettings(s) {
  try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
}

export function makeRemoteAdapter(settings = readSyncSettings()) {
  if (!settings || !settings.token) return null;
  return createGistAdapter({
    token: settings.token,
    gistId: settings.gistId || null,
    onGistId: gistId => writeSyncSettings({...settings, gistId}),
  });
}
