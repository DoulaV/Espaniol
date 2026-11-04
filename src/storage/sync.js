/*
 * Sync engine. It knows nothing about any particular database: it keeps the
 * local copy as the source of truth for the screen, and mirrors it to an
 * optional remote adapter (see adapters/template.js for the interface).
 *
 * Conflict rule (same as the original app): whole-document, last write wins,
 * compared by the `updated` timestamp.
 */
export function createSync({local, remote: initialRemote = null, normalize, getState, setState, onChange, onStatus,
  debounceMs = 600, connectTimeoutMs = 10000}) {
  let remote = initialRemote;
  let connected = false, saving = false, again = false, saveTimer = null, status = 'local';
  const setStatus = s => { status = s; onStatus(s); };
  const clone = o => JSON.parse(JSON.stringify(o));

  async function flush() {
    if (!connected) return;
    if (saving) { again = true; return; }
    saving = true;
    const r = remote;
    try { await r.save(clone(getState())); if (r === remote) setStatus('ok'); } catch (e) { if (r === remote) setStatus('err'); }
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
      else if (mine > theirs) { flush(); return; }
    } else if (mine > 0) {
      flush(); return;
    }
    setStatus('ok');
  }

  async function connectRemote() {
    const r = remote;
    setStatus('slow');
    const t = setTimeout(() => { if (status === 'slow' && r === remote) setStatus('local'); }, connectTimeoutMs);
    try {
      await r.connect();
      if (r !== remote) return;
      connected = true;
      r.subscribe(
        doc => { if (r !== remote) return; clearTimeout(t); handleRemote(doc); },
        () => { if (r !== remote) return; clearTimeout(t); connected = false; setStatus('local'); },
      );
    } catch (e) {
      clearTimeout(t);
      if (r === remote) { connected = false; setStatus('local'); }
      throw e;
    }
  }

  /** Load the local copy, then connect to the remote store if one is configured. */
  async function start() {
    const saved = local.load();
    if (saved) setState(normalize(saved));
    if (!remote) { setStatus('local'); return; }
    try { await connectRemote(); } catch (e) { /* stays on this device */ }
  }

  /** Switch to another remote (or null for this device only). Rejects if it cannot connect. */
  async function useRemote(next) {
    if (remote && remote.stop) remote.stop();
    clearTimeout(saveTimer);
    remote = next; connected = false;
    if (!remote) { setStatus('local'); return; }
    await connectRemote();
  }

  /** Ask the remote for its latest copy now, if it supports that. */
  function refresh() { if (connected && remote.refresh) remote.refresh(); }

  return {persist, start, flush, useRemote, refresh};
}
