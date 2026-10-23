import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import {readRepositoryVersions, validateReleaseVersion} from '../scripts/validate-release-version.mjs';
import {combinedReleaseNotes, findPreviousVersion, parseCommitMessage, renderChangelog} from '../scripts/generate-changelog.mjs';

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

test('release version is independent of consistent npm metadata', () => {
  assert.equal(validateReleaseVersion('V9.0.0', '1.0.1', '1.0.1'), '9.0.0');
  assert.throws(() => validateReleaseVersion('V1.2.3', '1.2.3', '1.2.2'), /package-lock.json/);
  const versions = readRepositoryVersions();
  assert.doesNotThrow(() => validateReleaseVersion(`V${versions.packageVersion}`, versions.packageVersion, versions.lockVersion));
});

test('release workflow keeps tag publication separate from master deployment', async () => {
  const release = await fs.readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
  const masterBuild = await fs.readFile(new URL('../.github/workflows/build.yml', import.meta.url), 'utf8');
  assert.match(release, /tags:\s*\['\*\*'\]/);
  assert.match(release, /git cat-file -t/);
  assert.match(release, /merge-base --is-ancestor/);
  assert.match(release, /gh release create/);
  assert.match(release, /--draft/);
  assert.match(release, /gh release edit/);
  assert.match(release, /package-release\.mjs/);
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
  assert.doesNotMatch(deploy, /tar -tzf "\$archive" \| grep/, 'listing must be captured before grep -q under pipefail');
  assert.doesNotMatch(deploy, /\| grep -[A-Za-z]*q/, 'no pipe into grep -q under pipefail (SIGPIPE on the writer)');
  assert.match(deploy, /StrictHostKeyChecking=yes/);
  assert.doesNotMatch(deploy, /skipping its deployment/);
  assert.match(release, /needs: \[build, publish\]/);
  assert.match(release, /needs: \[build, publish, deploy-test\]/);
  assert.match(masterBuild, /branches:\s*\[master\]/);
});

test('changelogs start after the newest final release, not after a candidate', async () => {
  const repo = await fs.mkdtemp(path.join(os.tmpdir(), 'mo-docs-tags-'));
  const run = (...args) => execFileSync('git', args, {cwd: repo, stdio: 'pipe'});
  run('init', '-q');
  run('-c', 'user.name=t', '-c', 'user.email=t@example.invalid', 'commit', '-q', '--allow-empty', '-m', 'docs: first');
  run('-c', 'user.name=t', '-c', 'user.email=t@example.invalid', 'tag', '-a', 'V1.0.0', '-m', 'V1.0.0');
  run('-c', 'user.name=t', '-c', 'user.email=t@example.invalid', 'commit', '-q', '--allow-empty', '-m', 'docs: second');
  run('-c', 'user.name=t', '-c', 'user.email=t@example.invalid', 'tag', '-a', 'V1.0.1-rc1', '-m', 'V1.0.1-rc1');
  const cwd = process.cwd();
  process.chdir(repo);
  try {
    assert.equal(findPreviousVersion('V1.0.1-rc2', 'HEAD'), 'V1.0.0');
    assert.equal(findPreviousVersion('V1.0.1', 'HEAD'), 'V1.0.0');
  } finally {
    process.chdir(cwd);
    await fs.rm(repo, {recursive: true, force: true});
  }
});

test('legacy Message.en / Message.zh-CN paragraphs are still read', () => {
  const legacy = parseCommitMessage([
    'docs: verify GPIO and peripheral loopbacks', '',
    'Message.en:', 'Document tested GPIO, UART5 and PWM loopbacks with real captures.', 'Separate untested paths.', '',
    'Message.zh-CN:', '记录 GPIO、UART5 与 PWM 回环实测。', '区分未实测路径。', '',
  ].join('\n'), 'abc123');
  assert.equal(legacy.en, 'Document tested GPIO, UART5 and PWM loopbacks with real captures. Separate untested paths.');
  assert.equal(legacy.zh, legacy.en);
  assert.equal(parseCommitMessage('docs: no message block at all\n\nJust prose.', 'def456').en, 'no message block at all');
});

test('historical English summaries feed both heading editions', () => {
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
  assert.match(chinese, /## 文档[\s\S]*Explain safe Debian package updates/);
  assert.match(chinese, /## 修复[\s\S]*Correct the Network guide link/);
  const combined = combinedReleaseNotes(english, chinese);
  assert.match(combined, /<summary>简体中文<\/summary>/);
  assert.match(combined, /# Mo documentation V0\.1\.0/);
  assert.match(combined, /# Mo 文档 V0\.1\.0/);
});

test('current English subjects and breaking-change bodies generate release entries', () => {
  const commit = parseCommitMessage('feat: add an endpoint\n\nBREAKING CHANGE: replace the old route', 'abc123');
  assert.equal(commit.en, 'add an endpoint');
  assert.equal(commit.zh, commit.en);
  assert.equal(commit.breaking, true);
  assert.match(renderChangelog('V1.0.0', [commit], 'zh'), /变更条目保留英文/);
});
