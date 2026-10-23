export function latestStable<T extends {version: string; prerelease: boolean}>(releases: readonly T[]): T | undefined;
