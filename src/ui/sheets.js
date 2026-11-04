/* Open and close the bottom sheets (session and log). */
import {$} from '../helpers.js';

export function openSheet(id) { $(id).hidden = false; document.body.style.overflow = 'hidden'; }
export function closeSheet(id) { $(id).hidden = true; document.body.style.overflow = ''; }
