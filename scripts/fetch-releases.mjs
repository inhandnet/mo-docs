#!/usr/bin/env node
// Builds src/data/generated/releases.json from GitHub so the Software page and
// release notes never need hand edits.
//
// Source order per board:
//   1. GitHub Releases API (preferred: version, date, notes, assets incl. SHA256SUMS)
//   2. ChangeLog.md in the repo (fallback while the repo has no Releases)
// If the network is unavailable the previous JSON is kept, so local builds still work.

import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outFile = path.join(root, 'src/data/generated/releases.json');

const BOARDS = [
  {id: 'mo-62a', repo: 'inhandnet/Mo62A', changelog: 'ChangeLog.md'},
  {id: 'mo-68a', repo: null, changelog: null}, // GitHub repo not published yet
];

const headers = {'User-Agent': 'inhand-developer-site'};
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function getJson(url) {
  const res = await fetch(url, {headers});
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

async function getText(url) {
  const res = await fetch(url, {headers});
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function fromReleases(repo) {
  const releases = await getJson(`https://api.github.com/repos/${repo}/releases?per_page=20`);
  return releases
    .filter((r) => !r.draft)
    .map((r) => ({
      version: r.tag_name.replace(/^v/, ''),
      date: r.published_at.slice(0, 10),
      prerelease: r.prerelease,
      url: r.html_url,
      notes: r.body ?? '',
      assets: r.assets.map((a) => ({name: a.name, size: a.size, url: a.browser_download_url})),
    }));
}

// "## v1.1.0 — 2026-08-19" headings split the changelog into versions.
function parseChangelog(text, repo, file) {
  const parts = text.split(/^## /m).slice(1);
  return parts.map((part) => {
    const [heading, ...body] = part.split('\n');
    const m = heading.match(/v?([\d.]+)\s*[—-]\s*(\d{4}-\d{2}-\d{2})/);
    return {
      version: m ? m[1] : heading.trim(),
      date: m ? m[2] : null,
      prerelease: false,
      url: `https://github.com/${repo}/blob/HEAD/${file}`,
      notes: body.join('\n').trim(),
      assets: [],
    };
  });
}

async function fetchBoard(board) {
  if (!board.repo) return {source: 'none', releases: []};
  const releases = await fromReleases(board.repo);
  if (releases.length) return {source: 'github-releases', releases};
  const text = await getText(`https://raw.githubusercontent.com/${board.repo}/HEAD/${board.changelog}`);
  return {source: 'changelog', releases: parseChangelog(text, board.repo, board.changelog)};
}

async function main() {
  const data = {generatedAt: new Date().toISOString(), boards: {}};
  try {
    for (const board of BOARDS) {
      const result = await fetchBoard(board);
      data.boards[board.id] = {repo: board.repo, ...result};
      console.log(`[fetch-releases] ${board.id}: ${result.releases.length} releases (${result.source})`);
    }
  } catch (err) {
    try {
      await fs.access(outFile);
      console.warn(`[fetch-releases] ${err.message}; keeping existing ${path.relative(root, outFile)}`);
      return;
    } catch {
      console.warn(`[fetch-releases] ${err.message}; writing empty data`);
    }
  }
  await fs.mkdir(path.dirname(outFile), {recursive: true});
  await fs.writeFile(outFile, JSON.stringify(data, null, 2) + '\n');
}

main();
