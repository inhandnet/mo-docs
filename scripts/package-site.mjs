#!/usr/bin/env node
import {mkdirSync, readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {targets} from './lib/site-targets.mjs';
import {parseVersion, git} from './lib/policy.mjs';
try {
  const [environment, version] = process.argv.slice(2);
  parseVersion(version);
  const marker = JSON.parse(readFileSync('build/deployment.json', 'utf8'));
  if (!targets[environment] || marker.version !== version || marker.environment !== environment ||
      marker.siteUrl !== targets[environment] || marker.baseUrl !== '/docs/' || marker.preview || marker.commit !== git('rev-parse', 'HEAD')) {
    throw new Error('Build metadata does not match the requested release and environment.');
  }
  mkdirSync('dist', {recursive: true});
  execFileSync('tar', ['-C', 'build', '-czf', `dist/mo-docs-${version}-${environment}.tar.gz`, '.'], {stdio: 'inherit'});
} catch (error) { console.error(error.message); process.exitCode = 1; }
