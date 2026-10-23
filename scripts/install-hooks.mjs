#!/usr/bin/env node
import {chmodSync, existsSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {git} from './lib/policy.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
if (!process.env.CI && existsSync(resolve(root, '.git'))) {
  if (git('rev-parse', '--show-toplevel') !== root) throw new Error('Run from this repository.');
  for (const name of ['commit-msg', 'pre-push']) chmodSync(resolve(root, '.githooks', name), 0o755);
  git('config', '--local', 'core.hooksPath', '.githooks');
  git('config', '--local', 'commit.template', '.gitmessage');
  console.log('Enabled commit message checks for this clone. Tags are checked by CI after push.');
}
