#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {tagPattern as exactVersion} from './lib/policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export function validateReleaseVersion(version, packageVersion, lockVersion) {
  if (!exactVersion.test(version ?? '') || version.includes('-')) {
    throw new Error('content releases must match V<major>.<minor>.<patch>; release candidates belong to developer');
  }
  // Tags version the content; npm metadata describes the build project separately.
  const expected = version.slice(1).replace(/-rc\d+$/, '');
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(packageVersion ?? '')) {
    throw new Error('package.json must declare a numeric build project version');
  }
  if (lockVersion !== packageVersion) {
    throw new Error('package-lock.json version must agree with package.json');
  }
  return expected;
}

export function readRepositoryVersions(repositoryRoot = root) {
  const read = file => JSON.parse(fs.readFileSync(path.join(repositoryRoot, file), 'utf8'));
  const pkg = read('package.json'), lock = read('package-lock.json');
  if (lock.packages?.['']?.version !== lock.version || lock.packages?.['']?.name !== pkg.name) {
    throw new Error('package-lock.json root metadata must agree with package.json');
  }
  return {packageVersion: pkg.version, lockVersion: lock.version};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const version = process.argv[2] ?? process.env.VERSION;
    const versions = readRepositoryVersions();
    validateReleaseVersion(version, versions.packageVersion, versions.lockVersion);
    process.stdout.write(`Validated documentation release ${version}\n`);
  } catch (error) {
    process.stderr.write(`Release gate: ${error.message}\n`);
    process.exitCode = 1;
  }
}
