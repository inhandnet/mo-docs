#!/usr/bin/env node
import {execFileSync} from 'node:child_process';
import {targetEnvironment} from './lib/site-targets.mjs';
try {
  const [target, verify] = process.argv.slice(2);
  if (verify && verify !== '--verify') throw new Error('Usage: build-site.mjs test|production [--verify]');
  const env = {...process.env, ...targetEnvironment(target)};
  execFileSync('npm', ['run', 'build'], {env, stdio: 'inherit'});
  if (verify) execFileSync('npm', ['run', 'test:browser'], {env, stdio: 'inherit'});
} catch (error) { console.error(error.message); process.exitCode = 1; }
