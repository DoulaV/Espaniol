/* Progreso > "Sync across devices": connect or disconnect the GitHub gist sync. */
import {$} from '../helpers.js';
import {connectSync, disconnectSync, isSyncOn, syncNow, onSyncStatus} from '../storage/index.js';
import {toast} from '../ui/toast.js';
import {burstFrom} from '../ui/bubbles.js';

const INFO_OFF = 'Keeps your phone and laptop in step by saving your progress to a private gist on your GitHub account. Free, and only you can see it.';
const INFO_ON = {
  ok: 'On. Your progress is saved to a private gist on GitHub and checked every minute while the app is open.',
  slow: 'Connecting to GitHub...',
  err: 'On, but the last save did not reach GitHub (probably offline). It will try again on your next change or when you tap Sync now.',
  local: 'On, but GitHub could not be reached. Your progress is safe on this device and will sync when you are back online.',
};

function render(status) {
  const on = isSyncOn();
  $('ghSetup').hidden = on;
  $('ghOn').hidden = !on;
  $('ghInfo').textContent = on ? (INFO_ON[status] || INFO_ON.ok) : INFO_OFF;
}

export function initSyncSettings() {
  let status = $('sync').dataset.s || 'local';
  onSyncStatus(s => { status = s; render(s); });
  render(status);

  $('ghConnect').onclick = async e => {
    const btn = e.currentTarget;
    const token = $('ghToken').value.trim();
    if (!token) { toast('Paste your GitHub token first'); return; }
    btn.disabled = true; btn.textContent = 'Connecting...';
    try {
      await connectSync(token);
      $('ghToken').value = '';
      burstFrom(btn, 24);
      toast('Sync is on');
    } catch (err) {
      toast(/token/i.test(err.message) ? 'GitHub did not accept that token' : 'Could not reach GitHub, try again');
    }
    btn.disabled = false; btn.textContent = 'Connect';
    render(status);
  };
  $('ghSyncNow').onclick = () => { syncNow(); toast('Checking GitHub'); };
  $('ghDisconnect').onclick = async () => { await disconnectSync(); toast('Sync is off on this device'); render('local'); };
}
