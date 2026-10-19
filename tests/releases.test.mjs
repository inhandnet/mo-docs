import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveImageRelease} from '../src/data/latest-image.mjs';
import {releaseFixture} from './fixtures/release.mjs';

test('download, view and checksums refer to the same published version', () => {
  const release = releaseFixture();
  assert.deepEqual(resolveImageRelease(release), {version: 'V1.1.0', url: release.html_url,
    imageUrl: release.assets[0].browser_download_url, checksumsUrl: release.assets[1].browser_download_url});
});

test('drafts, prereleases, incomplete uploads and unsafe or mismatched links are rejected', () => {
  for (const change of [
    r => { r.draft = true; }, r => { r.prerelease = true; }, r => { r.published_at = null; },
    r => { r.assets.pop(); }, r => { r.assets[0].state = 'new'; }, r => { r.assets[0].size = 0; },
    r => { r.assets[0].browser_download_url = 'https://example.com/image.img.xz'; },
    r => { r.assets[0].browser_download_url = r.assets[0].browser_download_url.replaceAll('V1.1.0', 'V1.0.0'); },
    r => { r.html_url = 'javascript:alert(1)'; }, r => { r.tag_name = 'V1.1.0-rc1'; },
    r => { r.assets.push({...r.assets[0]}); }, r => { r.assets[0].name = 'Source code.zip'; },
  ]) {
    const release = releaseFixture(); change(release);
    assert.equal(resolveImageRelease(release), null);
  }
  assert.equal(resolveImageRelease(null), null);
});
