export const releaseRepository = 'inhandnet/Mo62A';
export const releaseHistoryUrl = `https://github.com/${releaseRepository}/releases`;
export const latestReleaseApi = `https://api.github.com/repos/${releaseRepository}/releases/latest`;

// Resolve both actions from one published release, never from independently
// changing "latest" asset URLs. GitHub's source archives are not OS images.
export function resolveImageRelease(release) {
  const tag = release?.tag_name;
  if (release?.draft || release?.prerelease || !/^V(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(tag ?? '') || !release?.published_at) return null;
  const url = `${releaseHistoryUrl}/tag/${tag}`;
  if (release.html_url !== url || !Array.isArray(release.assets)) return null;
  const images = release.assets.filter(asset => asset.name?.endsWith('.img.xz'));
  const sums = release.assets.filter(asset => asset.name === 'SHA256SUMS');
  if (images.length !== 1 || sums.length !== 1) return null;
  for (const asset of [images[0], sums[0]]) {
    if (!/^[a-zA-Z0-9._-]+$/.test(asset.name) || asset.state !== 'uploaded' || asset.size <= 0 ||
      asset.browser_download_url !== `${releaseHistoryUrl}/download/${tag}/${asset.name}`) return null;
  }
  return {version: tag, url, imageUrl: images[0].browser_download_url, checksumsUrl: sums[0].browser_download_url};
}
