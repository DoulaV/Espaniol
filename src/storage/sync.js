/*
 * Sync engine. It knows nothing about any particular database: it keeps the
 * local copy as the source of truth for the screen, and mirrors it to an
 * optional remote adapter (see adapters/template.js for the interface).
 *
 * Conflict rule (same as the original app): whole-document, last write wins,
 * compared by the `updated` timestamp.
 */
export function createSync({local, remote, normalize, getState, setState, onChange, onStatus,
  debounceMs = 600, connectTimeoutMs = 10000}) {
  let connected = false, saving = false, again = false, saveTimer = null, status = 'local';
  const setStatus = s => { status = s; onStatus(s); };
  const clone = o => JSON.parse(JSON.stringify(o));

  async function flush() {
    if (!connected) return;
    if (saving) { again = true; return; }
    saving = true;
    try { await remote.save(clone(getState())); setStatus('ok'); } catch (e) { setStatus('err'); }
    saving = false;
    if (again) { again = false; flush(); }
  }

  /** Call after every change to the state. */
  function persist() {
    const S = getState();
    S.updated = Date.now();
    local.save(S);
    if (connected) { clearTimeout(saveTimer); saveTimer = setTimeout(flush, debounceMs); }
  }

  function handleRemote(doc) {
    const S = getState();
    const mine = S.updated || 0;
    if (doc) {
      const theirs = +doc.updated || 0;
      if (theirs > mine) { const next = normalize(doc); setState(next); local.save(next); onChange(); }
      else if (mine > theirs) flush();
    } else if (mine > 0) {
      flush();
    }
    setStatus('ok');
  }

  /** Load the local copy, then connect to the remote store if one is configured. */
  async function start() {
    const saved = local.load();
    if (saved) setState(normalize(saved));
    if (!remote) { setStatus('local'); return; }
    setStatus('slow');
    const t = setTimeout(() => { if (status === 'slow') setStatus('local'); }, connectTimeoutMs);
    try {
      await remote.connect();
      connected = true;
      remote.subscribe(
        doc => { clearTimeout(t); handleRemote(doc); },
        () => { clearTimeout(t); connected = false; setStatus('local'); },
      );
    } catch (e) {
      clearTimeout(t); connected = false; setStatus('local');
    }
  }

  return {persist, start, flush};
}
