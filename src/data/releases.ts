// Typed access to the release data written by scripts/fetch-releases.mjs.
import raw from './generated/releases.json';

export type Asset = {name: string; size: number; url: string};
export type Release = {
  version: string;
  date: string | null;
  prerelease: boolean;
  url: string;
  notes: string;
  assets: Asset[];
};
export type BoardReleases = {repo: string | null; source: string; releases: Release[]};

export const generatedAt: string = raw.generatedAt;
export const boards = raw.boards as unknown as Record<'mo-62a' | 'mo-68a', BoardReleases | undefined>;

export {latestStable as latestStableRelease} from './release-selection.mjs';
