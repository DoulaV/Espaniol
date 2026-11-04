/* Auto / light / dark theme switch, remembered on this device. */
import {$} from '../helpers.js';

const LS_THEME = 'mi-espanol-theme';
const THEMES = ['auto', 'light', 'dark'];
let theme = 'auto';
try { theme = localStorage.getItem(LS_THEME) || 'auto'; } catch (e) { /* ignore */ }

function applyTheme() {
  if (theme === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
  $('themeBtn').textContent = 'Theme: ' + theme;
}

export function initTheme() {
  $('themeBtn').addEventListener('click', () => {
    theme = THEMES[(THEMES.indexOf(theme) + 1) % 3];
    try { localStorage.setItem(LS_THEME, theme); } catch (e) { /* ignore */ }
    applyTheme();
  });
  applyTheme();
}
