#!/usr/bin/env node
import {readFileSync, writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {parseVersion, git} from './lib/policy.mjs';
import {targets} from './lib/site-targets.mjs';
try {
  const version = process.argv[2];
  parseVersion(version);
  const commit = git('rev-parse', 'HEAD');
  const archives = Object.entries(targets).map(([environment, siteUrl]) => {
    const file = `mo-docs-${version}-${environment}.tar.gz`;
    const marker = JSON.parse(execFileSync('tar', ['-xOzf', `dist/${file}`, './deployment.json'], {encoding: 'utf8'}));
    if (marker.version !== version || marker.commit !== commit || marker.environment !== environment || marker.url !== `${siteUrl}/docs/` || marker.preview) {
      throw new Error(`Mismatched archive: ${file}`);
    }
    return {file, environment, url: marker.url};
  });
  execFileSync('node', ['scripts/generate-changelog.mjs', '--version', version, '--output', 'dist'], {stdio: 'inherit'});
  writeFileSync('dist/release.json', JSON.stringify({version, commit, sourceDate: git('show', '-s', '--format=%cI', 'HEAD'), archives}, null, 2) + '\n');
  const files = [...archives.map(a => a.file), 'release.json', 'CHANGELOG.en.md', 'CHANGELOG.zh-CN.md', 'release-notes.md'];
  writeFileSync('dist/SHA256SUMS', files.map(file => `${createHash('sha256').update(readFileSync(`dist/${file}`)).digest('hex')}  ${file}\n`).join(''));
} catch (error) { console.error(error.message); process.exitCode = 1; }
