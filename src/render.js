/* A tiny registry so any module can ask for a full re-render without import cycles. */
const renderers = [];
export function onRender(fn) { renderers.push(fn); }
export function renderAll() { for (const fn of renderers) fn(); }
