// Synthetic metadata only; tests never download a firmware image.
export function releaseFixture() {
  const base = 'https://github.com/inhandnet/Mo62A/releases';
  return {tag_name: 'V1.1.0', draft: false, prerelease: false, published_at: '2026-10-16T00:00:00Z',
    html_url: `${base}/tag/V1.1.0`, assets: ['mo62a-trixie-xfce-V1.1.0.img.xz', 'SHA256SUMS'].map(name => ({
      name, size: 1234, state: 'uploaded', browser_download_url: `${base}/download/V1.1.0/${name}`,
    }))};
}
