/* Rising glass bubbles on a canvas behind the app, plus celebratory bursts. */
import {$} from '../helpers.js';

export const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let cv, cx;
let W = 0, H = 0, DPR = 1, bubbles = [], pops = [], bubbleRGB = '255,255,255', accentRGB = '255,90,60';
let last = performance.now();

function readColors() {
  const cs = getComputedStyle(document.documentElement);
  bubbleRGB = cs.getPropertyValue('--bubble').trim() || '255,255,255';
  const a = cs.getPropertyValue('--accent').trim();
  const m = a.match(/^#?([0-9a-f]{6})$/i);
  if (m) { const n = parseInt(m[1], 16); accentRGB = ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }
}
function resize() { DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight; cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0); }
function mkBubble(y) { const r = 6 + Math.random() * 30; return {x: Math.random() * W, y: y ?? (H + r + Math.random() * H), r, vy: .15 + Math.random() * .45 + r * .004, ph: Math.random() * 6.28, amp: .3 + Math.random() * .9, a: .25 + Math.random() * .35}; }
function seed() { bubbles = []; const n = Math.round(Math.min(34, Math.max(14, W * H / 38000))); for (let i = 0; i < n; i++) bubbles.push(mkBubble(Math.random() * H)); }
function drawBubble(b, alpha, tint) {
  const g = cx.createRadialGradient(b.x - b.r * .35, b.y - b.r * .4, b.r * .1, b.x, b.y, b.r);
  const c = tint || bubbleRGB;
  g.addColorStop(0, 'rgba(255,255,255,' + (.55 * alpha) + ')');
  g.addColorStop(.55, 'rgba(' + c + ',' + (.10 * alpha) + ')');
  g.addColorStop(.92, 'rgba(' + c + ',' + (.28 * alpha) + ')');
  g.addColorStop(1, 'rgba(' + c + ',0)');
  cx.beginPath(); cx.arc(b.x, b.y, b.r, 0, 6.283); cx.fillStyle = g; cx.fill();
  cx.beginPath(); cx.ellipse(b.x - b.r * .38, b.y - b.r * .42, b.r * .28, b.r * .16, -.6, 0, 6.283); cx.fillStyle = 'rgba(255,255,255,' + (.7 * alpha) + ')'; cx.fill();
  cx.beginPath(); cx.arc(b.x, b.y, b.r - .6, 0, 6.283); cx.strokeStyle = 'rgba(255,255,255,' + (.35 * alpha) + ')'; cx.lineWidth = 1; cx.stroke();
}
function frame(t) {
  const dt = Math.min(50, t - last) / 16.67; last = t; cx.clearRect(0, 0, W, H);
  for (const b of bubbles) { b.y -= b.vy * dt; b.ph += .012 * dt; b.x += Math.sin(b.ph) * b.amp * .4 * dt; if (b.y < -b.r - 10) Object.assign(b, mkBubble()); drawBubble(b, b.a); }
  for (let i = pops.length - 1; i >= 0; i--) {
    const p = pops[i]; p.life -= dt; p.vy += -.02 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .985;
    const a = Math.max(0, p.life / p.max); drawBubble(p, a, p.tint); if (p.life <= 0) pops.splice(i, 1);
  }
  if (!reduce.matches || pops.length) requestAnimationFrame(frame); else staticDraw();
}
function staticDraw() { cx.clearRect(0, 0, W, H); for (const b of bubbles) drawBubble(b, b.a); }

/** Pop a burst of bubbles at a screen point. */
export function burst(x, y, n) {
  if (reduce.matches) return;
  const start = !pops.length;
  for (let i = 0; i < (n || 22); i++) {
    const ang = Math.random() * 6.283, sp = 1 + Math.random() * 4;
    pops.push({x, y, r: 4 + Math.random() * 16, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2, life: 50 + Math.random() * 50, max: 100, tint: Math.random() < .5 ? accentRGB : bubbleRGB});
  }
  if (start && reduce.matches) requestAnimationFrame(frame);
}
/** Pop a burst from the centre of an element. */
export function burstFrom(el, n) { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, n); }

export function initBubbles() {
  cv = $('bubbles'); cx = cv.getContext('2d');
  readColors(); resize(); seed();
  if (reduce.matches) staticDraw(); else requestAnimationFrame(frame);
  addEventListener('resize', () => { resize(); seed(); if (reduce.matches) staticDraw(); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);
  new MutationObserver(readColors).observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
}
