#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exactVersion = /^V(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function validateReleaseVersion(version, packageVersion, lockVersion) {
  if (!exactVersion.test(version ?? '')) {
    throw new Error('release version must match V<major>.<minor>.<patch> exactly');
  }
  const expected = version.slice(1);
  if (packageVersion !== expected) {
    throw new Error(`package.json version ${packageVersion} does not match ${version}`);
  }
  if (lockVersion !== expected) {
    throw new Error(`package-lock.json version ${lockVersion} does not match ${version}`);
  }
  return expected;
}

export function readRepositoryVersions(repositoryRoot = root) {
  const read = file => JSON.parse(fs.readFileSync(path.join(repositoryRoot, file), 'utf8'));
  return {
    packageVersion: read('package.json').version,
    lockVersion: read('package-lock.json').version,
  };
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
