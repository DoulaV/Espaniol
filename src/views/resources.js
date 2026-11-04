/* Recursos: static link cards. */
import {RES} from '../content.js';
import {$, esc} from '../helpers.js';
import {ARROW} from './icons.js';

export function renderResources() {
  for (const k in RES) {
    $(k).innerHTML = RES[k].map(r => '<a class="glass res" href="' + r.u + '" target="_blank" rel="noopener"><span class="ico" style="--c1:' + r.c[0] + ';--c2:' + r.c[1] + '">' + r.i + '</span><div><h4>' + esc(r.t) + '</h4><p>' + esc(r.p) + '</p></div><span class="open" aria-hidden="true">' + ARROW + '</span></a>').join('');
  }
}
