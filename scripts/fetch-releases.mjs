#!/usr/bin/env node
// Explicit refresh of the reviewed release snapshot; builds never use the
// network. A failed refresh leaves the previous file intact and exits nonzero.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const defaultFile = path.join(root, 'src/data/generated/releases.json');
const BOARDS = [
  {id: 'mo-62a', repo: 'inhandnet/Mo62A'},
  {id: 'mo-68a', repo: null},
];

export async function fetchBoard(board, {fetchImpl = fetch, token = process.env.GITHUB_TOKEN,
  timeout = Number(process.env.FETCH_TIMEOUT_MS ?? 15000)} = {}) {
  if (!board.repo) return {repo: null, source: 'none', releases: []};
  const headers = {'User-Agent': 'inhand-developer-site', Accept: 'application/vnd.github+json'};
  if (token) headers.Authorization = `Bearer ${token}`;
  const releases = [];
  for (let page = 1; ; page++) {
    if (page > 100) throw new Error('Release history exceeds the supported page limit.');
    const response = await fetchImpl(`https://api.github.com/repos/${board.repo}/releases?per_page=100&page=${page}`, {
      headers, signal: AbortSignal.timeout(timeout),
    });
    if (!response.ok) throw new Error(`GitHub release request failed (HTTP ${response.status}).`);
    const records = await response.json();
    if (!Array.isArray(records)) throw new Error('GitHub release response must be an array.');
    for (const r of records) {
      if (r.draft || !r.published_at) continue;
      if (typeof r.tag_name !== 'string' || typeof r.prerelease !== 'boolean' ||
          typeof r.published_at !== 'string' || !Number.isFinite(Date.parse(r.published_at)) ||
          typeof r.html_url !== 'string' || !Array.isArray(r.assets)) {
        throw new Error('Invalid GitHub release metadata.');
      }
      const assets = r.assets.map(a => {
        if (typeof a.name !== 'string' || typeof a.size !== 'number' || typeof a.browser_download_url !== 'string') {
          throw new Error('Invalid GitHub release asset.');
        }
        return {name: a.name, size: a.size, url: a.browser_download_url};
      }).sort((a, b) => a.name.localeCompare(b.name, 'en'));
      releases.push({version: r.tag_name, date: r.published_at.slice(0, 10),
        prerelease: r.prerelease, url: r.html_url, notes: r.body ?? '', assets});
    }
    if (records.length < 100) break;
  }
  // Stable serialization, independent of GitHub's response order. Consumers
  // choose the latest stable image by version, keeping candidates in history.
  releases.sort((a, b) => b.date.localeCompare(a.date) || b.version.localeCompare(a.version, 'en', {numeric: true}));
  return {repo: board.repo, source: 'github-releases', releases};
}

export async function refreshReleases({outFile = defaultFile, boards = BOARDS, now = () => new Date(), ...options} = {}) {
  const results = {};
  for (const board of boards) results[board.id] = await fetchBoard(board, options);
  let previous;
  try { previous = JSON.parse(await fs.readFile(outFile, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (JSON.stringify(previous?.boards) === JSON.stringify(results)) return {changed: false};
  const data = {generatedAt: now().toISOString(), boards: results};
  await fs.mkdir(path.dirname(outFile), {recursive: true});
  const temporary = `${outFile}.${process.pid}.tmp`;
  try {
    await fs.writeFile(temporary, JSON.stringify(data, null, 2) + '\n', {flag: 'wx'});
    await fs.rename(temporary, outFile);
  } finally { await fs.rm(temporary, {force: true}); }
  return {changed: true};
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const {changed} = await refreshReleases();
    console.log(`[fetch-releases] ${changed ? 'Snapshot updated; review before committing.' : 'No release changes; snapshot unchanged.'}`);
  } catch (error) {
    console.error(`[fetch-releases] ${error.message} Snapshot not updated.`);
    process.exitCode = 1;
  }
}
