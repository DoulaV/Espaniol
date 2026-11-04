/* Small shared helpers: DOM lookup, escaping, dates and number formatting. */
export const $ = id => document.getElementById(id);
export const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const pad = n => String(n).padStart(2, '0');
/** Local calendar day key, e.g. "2026-11-04". */
export const dkey = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
export const today = () => dkey(new Date());
export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
export const fmt = n => n.toLocaleString('en-US', {maximumFractionDigits: n < 10 ? 1 : 0});
/** Monday of the week containing d, at local midnight. */
export function weekStart(d) { const x = new Date(d); const w = (x.getDay() + 6) % 7; x.setDate(x.getDate() - w); x.setHours(0, 0, 0, 0); return x; }
export const monthKey = (d = new Date()) => d.getFullYear() + '-' + pad(d.getMonth() + 1);
export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
