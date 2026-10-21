import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {readRepositoryVersions, validateReleaseVersion} from '../scripts/validate-release-version.mjs';
import {combinedReleaseNotes, parseCommitMessage, renderChangelog} from '../scripts/generate-changelog.mjs';

test('release tag uses the exact uppercase V semantic version', () => {
  for (const version of ['V0.1.0', 'V1.0.0', 'V12.34.56']) {
    assert.equal(validateReleaseVersion(version, version.slice(1), version.slice(1)), version.slice(1));
  }
  // A release candidate belongs to the declared version.
  assert.equal(validateReleaseVersion('V1.0.1-rc1', '1.0.1', '1.0.1'), '1.0.1');
  assert.equal(validateReleaseVersion('V2.0.0-rc12', '2.0.0', '2.0.0'), '2.0.0');
  assert.throws(() => validateReleaseVersion('V1.0.1-rc1', '1.0.1-rc1', '1.0.1-rc1'), /package.json/);
  for (const version of ['v1.0.0', 'V1.0', 'V1.0.0-rc.1', 'V1.0.0-rc0', 'V1.0.0-rc', 'V1.0.0-beta1', 'V01.0.0', 'V1.0.0.1', 'release-V1.0.0']) {
    assert.throws(() => validateReleaseVersion(version, '1.0.0', '1.0.0'), /must match/);
  }
});

test('release tag must agree with both npm metadata files', () => {
  assert.throws(() => validateReleaseVersion('V1.2.3', '1.2.2', '1.2.3'), /package.json/);
  assert.throws(() => validateReleaseVersion('V1.2.3', '1.2.3', '1.2.2'), /package-lock.json/);
  const versions = readRepositoryVersions();
  assert.doesNotThrow(() => validateReleaseVersion(`V${versions.packageVersion}`, versions.packageVersion, versions.lockVersion));
});

test('release workflow keeps tag publication separate from master deployment', async () => {
  const release = await fs.readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
  const masterBuild = await fs.readFile(new URL('../.github/workflows/build.yml', import.meta.url), 'utf8');
  assert.match(release, /tags:\s*\['V\*'\]/);
  assert.match(release, /git cat-file -t/);
  assert.match(release, /merge-base --is-ancestor/);
  assert.match(release, /gh release create/);
  assert.match(release, /--draft/);
  assert.match(release, /gh release edit/);
  assert.match(release, /generate-changelog\.mjs/);
  assert.match(release, /CHANGELOG\.en\.md/);
  assert.match(release, /CHANGELOG\.zh-CN\.md/);
  assert.match(release, /--notes-file dist\/release-notes\.md/);
  assert.match(release, /--title "\$VERSION"/);
  assert.doesNotMatch(release, /--title "Mo documentation \$VERSION"/);
  // Release candidates are prereleases that reach the test platform only.
  assert.match(release, /--prerelease="\$PRERELEASE"/);
  assert.match(release, /deploy-test:/);
  assert.match(release, /deploy-production:/);
  assert.match(release, /!contains\(github\.ref_name, '-rc'\)/);
  assert.match(release, /deploy-site\.sh/);
  const deploy = await fs.readFile(new URL('../.github/scripts/deploy-site.sh', import.meta.url), 'utf8');
  assert.match(deploy, /deploy-docs/);
  assert.match(deploy, /StrictHostKeyChecking=yes/);
  assert.match(deploy, /skipping its deployment/);
  assert.match(masterBuild, /branches:\s*\[master\]/);
});

test('bilingual commit messages produce English and Chinese changelogs', () => {
  const first = parseCommitMessage(`docs(mo-os): explain package updates

Message:
  en: Explain safe Debian package updates.
  zh: 说明安全更新 Debian 软件包的方法。
`, '1234567890abcdef');
  const second = parseCommitMessage(`fix: correct a broken link

Message:
  en: Correct the Network guide link.
  zh: 修复网络指南链接。
`, 'abcdef1234567890');
  const english = renderChangelog('V0.1.0', [first, second], 'en');
  const chinese = renderChangelog('V0.1.0', [first, second], 'zh');
  assert.match(english, /## Documentation[\s\S]*Explain safe Debian package updates/);
  assert.match(english, /## Fixes[\s\S]*Correct the Network guide link/);
  assert.match(chinese, /## 文档[\s\S]*说明安全更新 Debian 软件包的方法/);
  assert.match(chinese, /## 修复[\s\S]*修复网络指南链接/);
  const combined = combinedReleaseNotes(english, chinese);
  assert.match(combined, /<summary>简体中文<\/summary>/);
  assert.match(combined, /# Mo documentation V0\.1\.0/);
  assert.match(combined, /# Mo 文档 V0\.1\.0/);
});

test('commit policy rejects missing bilingual release text', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'mo-docs-message-'));
  t.after(() => fs.rm(directory, {recursive: true, force: true}));
  const valid = path.join(directory, 'valid');
  const invalid = path.join(directory, 'invalid');
  await fs.writeFile(valid, `docs: explain daily use

Message:
  en: Explain daily use of Mo OS.
  zh: 说明 Mo OS 的日常使用方法。
`);
  await fs.writeFile(invalid, 'docs: explain daily use\n');
  const checker = new URL('../scripts/check-commit-msg.sh', import.meta.url).pathname;
  assert.doesNotThrow(() => execFileSync(checker, ['--file', valid, '--require-bilingual']));
  const failure = spawnSync(checker, ['--file', invalid, '--require-bilingual'], {encoding: 'utf8'});
  assert.equal(failure.status, 1);
  assert.match(failure.stderr, /add one final Message block/);
});

test('changelog parser rejects incomplete or untranslated Message blocks', () => {
  assert.throws(() => parseCommitMessage(`docs: missing chinese

Message:
  en: Explain the change.
`), /only en and zh/);
  assert.throws(() => parseCommitMessage(`docs: untranslated

Message:
  en: Explain the change.
  zh: English only.
`), /must contain Chinese/);
});
