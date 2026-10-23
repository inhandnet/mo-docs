import type {ReactNode} from 'react';
import Link from '@site/src/components/DocumentationLink';
import {getProduct, type Product} from '@site/src/data/products';
import {boards, latestStableRelease} from '@site/src/data/releases';
import DocumentationTable from '@site/src/components/DocumentationTable';

// Shows its children only for the given board; used in shared partials (docs/_partials).
export function Only({board, is, children}: {board: string; is: string | string[]; children: ReactNode}): ReactNode {
  return (Array.isArray(is) ? is.includes(board) : board === is) ? <>{children}</> : null;
}

// Public notice for content that is not yet available.
export function ComingSoon(): ReactNode {
  return (
    <div className="mo-stub">
      <strong>Coming soon.</strong> This content is being prepared. Use the{' '}
      <Link to="/contact">contact page</Link> for product questions.
    </div>
  );
}

// Release notes live with each image on GitHub Releases.
export function ReleaseNotes({board}: {board: Product['id']}): ReactNode {
  const p = getProduct(board);
  if (!p.githubUrl) {
    return (
      <p>
        <span className="mo-badge">Coming soon</span> Release notes will appear here when the {p.name} repository is
        published on GitHub.
      </p>
    );
  }
  return (
    <ul>
      <li>
        <Link href={`${p.githubUrl}/releases`}>All {p.name} releases on GitHub</Link> — read the release notes and check the assets supplied for that version.
      </li>
      <li>
        <Link href={`${p.githubUrl}/releases/latest`}>Latest release</Link> — opens the newest published release.
      </li>
    </ul>
  );
}

// Unified download list for one board (docs › board › Resource download), built from products.ts and release data.
export function BoardDownloads({board}: {board: Product['id']}): ReactNode {
  const p = getProduct(board);
  const latest = latestStableRelease(boards[board]?.releases ?? []);
  const rows: {item: string; where: ReactNode}[] = [
    {
      item: 'OS image',
      where: (
        <>
          {latest ? <>{latest.version}{latest.date ? ` (${latest.date})` : ''} — </> : null}
          <Link to="/software#os-images">Software page</Link> · <Link href={p.resourcesUrl}>InHand Resource Center</Link>
        </>
      ),
    },
    ...['models', 'tools', 'examples'].map(name => ({
      item: `mo-${name}`,
      where: <Link href={`https://github.com/inhandnet/mo-${name}/releases`}>Releases and source</Link>,
    })),
    {
      item: 'Datasheet',
      where: p.datasheetUrl ? <Link href={p.datasheetUrl}>PDF</Link> : <Link href={p.resourcesUrl}>InHand Resource Center</Link>,
    },
    {
      item: 'Schematics',
      where: <Link to={`/docs/${board}/hardware-development/schematics`}>Schematics</Link>,
    },
    {
      item: 'Source code (SDK, BSP)',
      where: p.githubUrl ? <Link href={p.githubUrl}>{p.githubUrl.replace('https://', '')}</Link> : <span className="mo-muted">Coming soon</span>,
    },
    {
      item: '3D model and drawings',
      where: <Link to={`/docs/${board}/hardware-development/mechanical`}>Mechanical</Link>,
    },
    {
      item: 'Compliance documents',
      where: <Link to={`/docs/${board}/compliance/declarations`}>Declarations & test reports</Link>,
    },
  ];
  return (
    <DocumentationTable className="mo-spec-table">
      <tbody>
        {rows.map((r) => (
          <tr key={r.item}>
            <th scope="row">{r.item}</th>
            <td>{r.where}</td>
          </tr>
        ))}
      </tbody>
    </DocumentationTable>
  );
}

// Image ↔ firmware ↔ toolchain mapping. Update rows against verified releases.
const VERSION_ROWS = [
  {board: 'Mo 62A', image: 'V1.1.0 development board (image build: 2026-08-19; GitHub release: 2026-10-16)', base: 'TI Processor SDK Linux RT EdgeAI 11.01.07.05', tidl: '11_02_17_00', ort: '1.23.0'},
  {board: 'Mo 68A', image: 'Not verified', base: 'To be published', tidl: 'To be published', ort: 'To be published'},
];

export function VersionMap(): ReactNode {
  return (
    <>
      <p>These rows describe a documented software combination; they are not a manifest of every released image. Check the board-specific version map and model compatibility records before deployment.</p>
      <DocumentationTable className="mo-spec-table">
        <thead>
          <tr>
            <th>Board</th>
            <th>Image</th>
            <th>TI SDK base</th>
            <th>TIDL / edgeai-tidl-tools</th>
            <th>ONNX Runtime</th>
          </tr>
        </thead>
        <tbody>
          {VERSION_ROWS.map((r) => (
            <tr key={r.board}>
              <th scope="row">{r.board}</th>
              <td>{r.image}</td>
              <td>{r.base}</td>
              <td>{r.tidl}</td>
              <td>{r.ort}</td>
            </tr>
          ))}
        </tbody>
      </DocumentationTable>
    </>
  );
}
