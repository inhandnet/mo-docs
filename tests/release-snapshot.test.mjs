import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, rm, writeFile, stat} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fetchBoard, refreshReleases} from '../scripts/fetch-releases.mjs';
import {latestStable} from '../src/data/release-selection.mjs';

const board = {id: 'test-board', repo: 'example/board'};
const release = (tag = 'V1.0.0', extra = {}) => ({tag_name: tag, draft: false, prerelease: false,
  published_at: '2026-10-23T00:00:00Z', html_url: `https://github.com/example/board/releases/tag/${tag}`,
  body: 'Release notes', assets: [], ...extra});
const response = records => ({ok: true, json: async () => records});
async function fixture(t) {
  const dir = await mkdtemp(join(tmpdir(), 'release-snapshot-'));
  t.after(() => rm(dir, {recursive: true, force: true}));
  return join(dir, 'releases.json');
}

test('empty releases do not fetch a nonexistent changelog; unconfigured boards use no network', async () => {
  const urls = [];
  const options = {fetchImpl: async url => {urls.push(url); return response([]);}};
  assert.deepEqual((await fetchBoard(board, options)).releases, []);
  assert.equal(urls.length, 1);
  assert.match(urls[0], /api.github.com\/repos\/example\/board\/releases/);
  assert.deepEqual(await fetchBoard({repo: null}, options), {repo: null, source: 'none', releases: []});
  assert.equal(urls.length, 1);
});

test('pagination retains older stable images and skips drafts or unpublished records', async () => {
  let calls = 0;
  const result = await fetchBoard(board, {fetchImpl: async () => response(++calls === 1
    ? Array.from({length: 100}, (_, i) => release(`V2.0.0-rc${i + 1}`, {prerelease: true}))
    : [release(), release('V3.0.0', {draft: true}), release('V4.0.0', {published_at: null})])});
  assert.equal(calls, 2);
  assert.equal(result.releases.length, 101);
  assert.equal(latestStable(result.releases).version, 'V1.0.0');
});

test('failed refresh preserves existing bytes and never creates a partial first snapshot', async t => {
  const outFile = await fixture(t);
  const previous = '{"generatedAt":"unchanged","boards":{}}\n';
  const options = {outFile, boards: [board, {...board, id: 'second'}], fetchImpl: async () => {throw new Error('offline');}};
  await writeFile(outFile, previous);
  await assert.rejects(refreshReleases(options), /offline/);
  assert.equal(await readFile(outFile, 'utf8'), previous);
  await rm(outFile);
  let calls = 0;
  await assert.rejects(refreshReleases({...options, fetchImpl: async () => {
    if (++calls === 2) throw new Error('second board failed'); return response([release()]);
  }}), /second board failed/);
  await assert.rejects(stat(outFile), {code: 'ENOENT'});
});

test('unchanged data retains timestamp and bytes; changed data replaces the whole snapshot', async t => {
  const outFile = await fixture(t);
  const options = {outFile, boards: [board], now: () => new Date('2026-10-23T00:00:00Z'), fetchImpl: async () => response([release()])};
  assert.equal((await refreshReleases(options)).changed, true);
  const original = await readFile(outFile, 'utf8');
  assert.equal((await refreshReleases({...options, now: () => {throw new Error('timestamp should not change');}})).changed, false);
  assert.equal(await readFile(outFile, 'utf8'), original);
  assert.equal((await refreshReleases({...options, fetchImpl: async () => response([release('V1.1.0')])})).changed, true);
  assert.equal(JSON.parse(await readFile(outFile)).boards[board.id].releases[0].version, 'V1.1.0');
});

test('latest stable ignores candidate labels and API order and compares versions numerically', () => {
  const records = [
    {version: 'V3.0.0-rc1', prerelease: false}, {version: 'V4.0.0', prerelease: true},
    {version: 'v1.9.0', prerelease: false}, {version: 'V1.10.0', prerelease: false},
    {version: 'latest', prerelease: false}, {version: 'V1.2.0', prerelease: false},
  ];
  assert.equal(latestStable(records), records[3]);
  assert.equal(latestStable(records.slice(0, 2)), undefined);
  assert.equal(latestStable([]), undefined);
});
