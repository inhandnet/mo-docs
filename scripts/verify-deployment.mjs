#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {basename, dirname, join} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {targets} from './lib/site-targets.mjs';
import {parseVersion, git} from './lib/policy.mjs';
try {
  const [archive, environment, liveFile] = process.argv.slice(2);
  const version = process.env.VERSION;
  parseVersion(version);
  if (!targets[environment]) throw new Error('Unknown deployment platform.');
  const sums = readFileSync(join(dirname(archive), 'SHA256SUMS'), 'utf8').trim().split('\n');
  const entries = sums.map(line => /^([a-f0-9]{64})  (.+)$/.exec(line)).filter(m => m?.[2] === basename(archive));
  if (entries.length !== 1 || createHash('sha256').update(readFileSync(archive)).digest('hex') !== entries[0][1]) {
    throw new Error('The selected archive must have one matching checksum.');
  }
  const marker = JSON.parse(execFileSync('tar', ['-xOzf', archive, './deployment.json'], {encoding: 'utf8'}));
  if (marker.version !== version || marker.commit !== git('rev-parse', 'HEAD') || marker.environment !== environment ||
      marker.siteUrl !== targets[environment] || marker.baseUrl !== '/docs/' || marker.url !== `${targets[environment]}/docs/` || marker.preview) {
    throw new Error('Archive deployment metadata does not match the release destination.');
  }
  if (liveFile) {
    const live = JSON.parse(readFileSync(liveFile, 'utf8'));
    for (const key of ['version', 'commit', 'environment', 'siteUrl', 'baseUrl', 'url', 'preview']) {
      if (live[key] !== marker[key]) throw new Error(`Live deployment mismatch: ${key}`);
    }
    console.log(`Verified online ${environment} deployment: ${version} ${marker.commit}`);
  }
} catch (error) { console.error(`Deployment gate: ${error.message}`); process.exitCode = 1; }
