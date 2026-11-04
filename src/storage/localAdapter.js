/* Saves the tracker in this browser's localStorage. Always on, so the app works offline. */
const KEY = 'mi-espanol-v1';

export const localAdapter = {
  load() {
    try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  },
  save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* storage full or blocked */ }
  },
};
