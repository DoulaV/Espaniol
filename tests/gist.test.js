// Checks the GitHub gist adapter against a fake GitHub API. Run: npm test
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createGistAdapter, GIST_FILE, GistAuthError} from '../src/storage/adapters/gist.js';

function fakeGitHub({token = 'good', gists = {}} = {}) {
  const calls = [];
  let n = 0;
  const json = (status, body) => ({ok: status < 300, status, json: async () => body, text: async () => JSON.stringify(body)});
  async function fetchImpl(url, opts = {}) {
    const method = opts.method || 'GET';
    const path = url.replace('https://api.github.com', '');
    calls.push(method + ' ' + path.split('?')[0]);
    if (opts.headers.Authorization !== 'Bearer ' + token) return json(401, {});
    if (method === 'GET' && path.startsWith('/gists?')) return json(200, Object.values(gists).map(g => ({id: g.id, files: {[g.file]: {}}})));
    const m = path.match(/^\/gists\/(\w+)$/);
    if (m && method === 'GET') { const g = gists[m[1]]; return g ? json(200, {id: g.id, files: {[g.file]: {content: g.content}}}) : json(404, {}); }
    if (m && method === 'PATCH') { const g = gists[m[1]]; if (!g) return json(404, {}); g.content = JSON.parse(opts.body).files[GIST_FILE].content; return json(200, {}); }
    if (path === '/gists' && method === 'POST') {
      const body = JSON.parse(opts.body); const id = 'new' + (++n);
      gists[id] = {id, file: GIST_FILE, content: body.files[GIST_FILE].content, public: body.public};
      return json(201, {id});
    }
    return json(404, {});
  }
  return {fetchImpl, calls, gists};
}
const tick = () => new Promise(r => setTimeout(r, 5));

test('finds an existing gist and reads the data', async () => {
  const gh = fakeGitHub({gists: {abc: {id: 'abc', file: GIST_FILE, content: '{"updated":5,"anki":300}'}, other: {id: 'other', file: 'notes.md', content: ''}}});
  let saved = 'unset';
  const a = createGistAdapter({token: 'good', fetchImpl: gh.fetchImpl, onGistId: id => { saved = id; }});
  await a.connect();
  assert.equal(saved, 'abc');
  let got; a.subscribe(d => { got = d; }, () => {}); await tick();
  assert.equal(got.anki, 300);
});

test('no gist yet: reports null, then the first save creates a private gist', async () => {
  const gh = fakeGitHub();
  let saved = 'unset';
  const a = createGistAdapter({token: 'good', fetchImpl: gh.fetchImpl, onGistId: id => { saved = id; }});
  await a.connect();
  assert.equal(saved, null);
  let got = 'unset'; a.subscribe(d => { got = d; }, () => {}); await tick();
  assert.equal(got, null);
  await a.save({updated: 9, anki: 1});
  assert.equal(saved, 'new1');
  assert.equal(gh.gists.new1.public, false);
  await a.save({updated: 10, anki: 2});
  assert.equal(JSON.parse(gh.gists.new1.content).anki, 2);
  assert.equal(Object.keys(gh.gists).length, 1);
});

test('uses the remembered gist id without listing', async () => {
  const gh = fakeGitHub({gists: {abc: {id: 'abc', file: GIST_FILE, content: '{"updated":1}'}}});
  const a = createGistAdapter({token: 'good', gistId: 'abc', fetchImpl: gh.fetchImpl});
  await a.connect();
  assert.deepEqual(gh.calls, ['GET /gists/abc']);
});

test('a bad token is refused on connect', async () => {
  const gh = fakeGitHub();
  const a = createGistAdapter({token: 'bad', fetchImpl: gh.fetchImpl});
  await assert.rejects(a.connect(), GistAuthError);
});

test('being offline during a check does not turn sync off', async () => {
  const a = createGistAdapter({token: 'good', gistId: 'abc', fetchImpl: async () => { throw new TypeError('Failed to fetch'); }});
  let errors = 0, data = 0;
  a.subscribe(() => data++, () => errors++); await tick();
  assert.equal(errors, 0); assert.equal(data, 0);
});
