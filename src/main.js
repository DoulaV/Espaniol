/* App entry: load styles, read saved data, wire every screen, render, start syncing. */
import './styles/index.css';
import {initStorage} from './storage/index.js';
import {onRender, renderAll} from './render.js';
import {initBubbles} from './ui/bubbles.js';
import {initTheme} from './ui/theme.js';
import {initTabs} from './ui/tabs.js';
import {renderHoy} from './views/today.js';
import {renderProg, initProgress} from './views/progress.js';
import {renderVer, initWatch} from './views/watch.js';
import {renderResources} from './views/resources.js';
import {initLogSheet} from './views/logSheet.js';
import {initSession, sessionActive} from './views/session.js';
import {initSyncSettings} from './views/syncSettings.js';
import {registerSW} from 'virtual:pwa-register';

onRender(renderHoy);
onRender(renderProg);
onRender(renderVer);

// initStorage loads the local copy synchronously, then connects to a remote in the background.
const storageReady = initStorage();

initBubbles();
initTheme();
initTabs();
renderResources();
initProgress();
initSyncSettings();
initWatch();
initLogSheet();
initSession();
renderAll();
storageReady.catch(() => {});

setInterval(() => { if (!sessionActive()) renderHoy(); }, 60000);

registerSW({immediate: true});
