// Checks the sync engine's last-write-wins rules with a fake remote. Run: npm test
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSync} from '../src/storage/sync.js';

const normalize = d => ({...d});
function harness({localData = null, remote = null} = {}) {
  let S = {updated: 0};
  const saved = [];
  const statuses = [];
  let changes = 0;
  const local = {load: () => localData, save: d => saved.push(JSON.parse(JSON.stringify(d)))};
  const sync = createSync({local, remote, normalize, getState: () => S, setState: n => { S = n; },
    onChange: () => changes++, onStatus: s => statuses.push(s), debounceMs: 0});
  return {sync, get S() { return S; }, saved, statuses, get changes() { return changes; }};
}
function fakeRemote(doc) {
  const r = {doc, saves: [], push: null,
    async connect() {},
    subscribe(onData) { r.push = onData; queueMicrotask(() => onData(r.doc)); },
    async save(d) { r.saves.push(d); r.doc = d; }};
  return r;
}
const tick = () => new Promise(r => setTimeout(r, 5));

test('no remote: loads local copy and reports "local"', async () => {
  const h = harness({localData: {updated: 5, anki: 100}});
  await h.sync.start();
  assert.equal(h.S.anki, 100);
  assert.deepEqual(h.statuses, ['local']);
});

test('remote newer than local replaces local and re-renders', async () => {
  const remote = fakeRemote({updated: 200, anki: 500});
  const h = harness({localData: {updated: 100, anki: 50}, remote});
  await h.sync.start(); await tick();
  assert.equal(h.S.anki, 500);
  assert.equal(h.changes, 1);
  assert.equal(h.statuses.at(-1), 'ok');
});

test('local newer than remote is pushed up', async () => {
  const remote = fakeRemote({updated: 100, anki: 50});
  const h = harness({localData: {updated: 200, anki: 500}, remote});
  await h.sync.start(); await tick();
  assert.equal(remote.saves.length, 1);
  assert.equal(remote.saves[0].anki, 500);
});

test('empty remote gets the local data', async () => {
  const remote = fakeRemote(null);
  const h = harness({localData: {updated: 10, anki: 1}, remote});
  await h.sync.start(); await tick();
  assert.equal(remote.saves[0].anki, 1);
});

test('persist saves locally and to the remote', async () => {
  const remote = fakeRemote(null);
  const h = harness({remote});
  await h.sync.start(); await tick();
  h.S.anki = 7; h.sync.persist(); await tick();
  assert.equal(h.saved.at(-1).anki, 7);
  assert.equal(remote.saves.at(-1).anki, 7);
  assert.ok(h.S.updated > 0);
});

test('failed connect falls back to this device', async () => {
  const h = harness({remote: {async connect() { throw new Error('offline'); }, subscribe() {}, async save() {}}});
  await h.sync.start();
  assert.equal(h.statuses.at(-1), 'local');
});

test('switching remote on later pulls newer data from it', async () => {
  const h = harness({localData: {updated: 1, anki: 0}});
  await h.sync.start();
  const remote = fakeRemote({updated: 50, anki: 900});
  await h.sync.useRemote(remote); await tick();
  assert.equal(h.S.anki, 900);
  await h.sync.useRemote(null);
  assert.equal(h.statuses.at(-1), 'local');
});
