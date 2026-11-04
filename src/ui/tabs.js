/* Bottom tab bar: Hoy, Progreso, Ver, Recursos. */
import {$} from '../helpers.js';
import {reduce} from './bubbles.js';

function showTab(name) {
  document.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === name ? 'true' : 'false'));
  ['hoy', 'prog', 'ver', 'res'].forEach(v => { $('v-' + v).hidden = v !== name; });
  window.scrollTo({top: 0, behavior: reduce.matches ? 'auto' : 'smooth'});
}

export function initTabs() {
  document.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));
}
