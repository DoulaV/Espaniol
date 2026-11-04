/* Two-note chime played when a session block ends. */
let actx = null;
export function chime() {
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const now = actx.currentTime;
    [880, 1320].forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0, now + i * .12);
      g.gain.linearRampToValueAtTime(.18, now + i * .12 + .02);
      g.gain.exponentialRampToValueAtTime(.0001, now + i * .12 + .9);
      o.connect(g).connect(actx.destination);
      o.start(now + i * .12); o.stop(now + i * .12 + 1);
    });
  } catch (e) { /* audio not available */ }
}
