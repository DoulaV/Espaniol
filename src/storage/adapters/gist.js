/*
 * Sync through a PRIVATE GitHub gist on your own account.
 *
 * Needs a GitHub "classic" token with only the `gist` permission. The token
 * is kept in this browser's localStorage, never in the code.
 *
 * The tracker is saved as one file, mi-espanol.json, in a secret gist.
 * The app looks for it when you connect, and creates it if it isn't there.
 * It checks for changes when the app opens, when you come back to it, and
 * every minute while it is on screen.
 */
export const GIST_FILE = 'mi-espanol.json';
const API = 'https://api.github.com';
const POLL_MS = 60000;

export class GistAuthError extends Error {}

export function createGistAdapter({token, gistId = null, onGistId = () => {}, fetchImpl = (...a) => fetch(...a), pollMs = POLL_MS}) {
  let id = gistId;
  let timer = null, onData = null, onError = null, stopped = false;
  const onVisible = () => { if (document.visibilityState === 'visible') pull(); };
  const onOnline = () => pull();

  async function api(path, opts = {}) {
    const res = await fetchImpl(API + path, {
      ...opts,
      cache: 'no-store',
      headers: {
        Authorization: 'Bearer ' + token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(opts.body ? {'Content-Type': 'application/json'} : {}),
      },
    });
    if (res.status === 401 || res.status === 403) throw new GistAuthError('GitHub did not accept the token (' + res.status + ')');
    return res;
  }

  async function findGist() {
    for (let page = 1; page <= 10; page++) {
      const res = await api('/gists?per_page=100&page=' + page);
      if (!res.ok) throw new Error('Could not list gists (' + res.status + ')');
      const list = await res.json();
      const hit = list.find(g => g.files && g.files[GIST_FILE]);
      if (hit) return hit.id;
      if (list.length < 100) return null;
    }
    return null;
  }

  async function readDoc() {
    if (!id) return null;
    const res = await api('/gists/' + id);
    if (res.status === 404) { id = null; onGistId(null); return null; }
    if (!res.ok) throw new Error('Could not read gist (' + res.status + ')');
    const g = await res.json();
    const f = g.files && g.files[GIST_FILE];
    if (!f) return null;
    let text = f.content;
    if (f.truncated && f.raw_url) text = await (await fetchImpl(f.raw_url, {cache: 'no-store'})).text();
    try { return JSON.parse(text); } catch (e) { return null; }
  }

  async function pull() {
    if (stopped || !onData) return;
    try { onData(await readDoc()); }
    catch (e) { if (e instanceof GistAuthError) onError && onError(e); /* offline: try again later */ }
  }

  return {
    async connect() {
      // Checks the token works and finds the existing gist, if any.
      if (id) {
        const res = await api('/gists/' + id);
        if (res.ok) return;
        if (res.status !== 404) throw new Error('Could not reach GitHub (' + res.status + ')');
      }
      id = await findGist();
      onGistId(id);
    },
    subscribe(dataCb, errorCb) {
      onData = dataCb; onError = errorCb;
      pull();
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', onVisible);
        addEventListener('online', onOnline);
        timer = setInterval(() => { if (document.visibilityState === 'visible') pull(); }, pollMs);
      }
    },
    refresh: pull,
    async save(doc) {
      const body = {files: {[GIST_FILE]: {content: JSON.stringify(doc, null, 1)}}};
      if (id) {
        const res = await api('/gists/' + id, {method: 'PATCH', body: JSON.stringify(body)});
        if (res.ok) return;
        if (res.status !== 404) throw new Error('Could not save gist (' + res.status + ')');
      }
      const res = await api('/gists', {method: 'POST', body: JSON.stringify({...body, description: 'Mi Español progress (synced by the app)', public: false})});
      if (!res.ok) throw new Error('Could not create gist (' + res.status + ')');
      id = (await res.json()).id;
      onGistId(id);
    },
    stop() {
      stopped = true; clearInterval(timer);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisible);
        removeEventListener('online', onOnline);
      }
    },
  };
}
