import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import Link from '@site/src/components/DocumentationLink';
import {latestReleaseApi, resolveImageRelease} from '@site/src/data/latest-image.mjs';

type ReleaseState = {release: ReturnType<typeof resolveImageRelease>; status: string};
const ReleaseContext = createContext<ReleaseState | undefined>(undefined);

// One lookup for the whole section keeps the image and its checksum file paired,
// even if a new release is published while this page is open.
export function ImageReleaseProvider({children}: {children: ReactNode}) {
  const [release, setRelease] = useState<ReturnType<typeof resolveImageRelease>>(null);
  const [status, setStatus] = useState('Checking the latest release…');
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 10000);
    async function load() {
      try {
        const response = await fetch(latestReleaseApi, {signal: controller.signal, headers: {Accept: 'application/vnd.github+json'}});
        if (response.status === 404) {
          if (active) setStatus('No published image is available yet.');
          return;
        }
        if (!response.ok) throw new Error('Release lookup failed');
        const resolved = resolveImageRelease(await response.json());
        if (active) {
          setRelease(resolved);
          setStatus(resolved ? `${resolved.version} · Latest release` : 'No complete OS image is available in the latest release.');
        }
      } catch {
        if (active) setStatus('The download link could not be loaded. Use view all releases to download from GitHub.');
      } finally { clearTimeout(timer); }
    }
    void load();
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, []);

  return <ReleaseContext.Provider value={{release, status}}>
    {children}
    <span className="mo-image-status sr-only" role="status">{status}</span>
  </ReleaseContext.Provider>;
}

export default function ImageDownload({children, asset = 'image'}: {children: ReactNode; asset?: 'image' | 'checksums'}) {
  const state = useContext(ReleaseContext);
  if (!state) throw new Error('ImageDownload requires ImageReleaseProvider');
  const {release, status} = state;
  return <span className={asset === 'image' ? 'mo-image-download' : 'mo-checksums-download'}>
    {release ? <Link href={asset === 'image' ? release.imageUrl : release.checksumsUrl}
      title={`Download ${asset === 'image' ? 'the OS image' : 'SHA256SUMS'} for ${release.version}`}>{children}</Link>
      : <span title={status} aria-disabled="true">{children}</span>}
  </span>;
}
