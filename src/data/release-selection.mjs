// A candidate (including a tag incorrectly marked as stable upstream) must
// never become the recommended stable image. Compare versions, not API order.
export function latestStable(releases) {
  let latest;
  let version = [];
  for (const release of releases) {
    const match = /^[Vv]?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.exec(release.version);
    if (release.prerelease || !match) continue;
    const parts = match.slice(1).map(BigInt);
    const different = parts.findIndex((part, index) => part !== version[index]);
    if (!latest || (different !== -1 && parts[different] > version[different])) {
      latest = release;
      version = parts;
    }
  }
  return latest;
}
