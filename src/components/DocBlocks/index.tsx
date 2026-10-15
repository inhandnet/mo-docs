import type {ReactNode} from 'react';
import Link from '@site/src/components/DocumentationLink';
import {getProduct, type Product} from '@site/src/data/products';
import {SpecTable} from '@site/src/components/SpecTable';
import {boards, generatedAt} from '@site/src/data/releases';

// Shows its children only for the given board; used in shared partials (docs/_partials).
export function Only({board, is, children}: {board: string; is: string | string[]; children: ReactNode}): ReactNode {
  return (Array.isArray(is) ? is.includes(board) : board === is) ? <>{children}</> : null;
}

// Marks a planned page. `priority` is the GTM phase (P0 = before launch).
export function ComingSoon({priority, source}: {priority?: string; source?: string}): ReactNode {
  return (
    <div className="mo-stub">
      <strong>Coming soon.</strong> This page is planned{priority ? ` (${priority})` : ''} but not written yet.
      {source ? <> Existing material: {source}.</> : null} Questions in the meantime? Ask on the{' '}
      <Link href="https://community.inhand.com">forum</Link>.
    </div>
  );
}

export function BoardSpecs({board}: {board: Product['id']}): ReactNode {
  return <SpecTable product={getProduct(board)} />;
}

// Release notes come from scripts/fetch-releases.mjs (GitHub Releases or ChangeLog.md).
export function ReleaseNotes({board}: {board: Product['id']}): ReactNode {
  const data = boards[board];
  if (!data || data.releases.length === 0) {
    return (
      <p>
        <span className="mo-badge">Coming soon</span> Release notes will appear here when the {getProduct(board).name}{' '}
        repository is published on GitHub.
      </p>
    );
  }
  return (
    <>
      <p className="mo-muted">
        Generated from <Link href={`https://github.com/${data.repo}`}>{data.repo}</Link> ({data.source}) on{' '}
        {generatedAt.slice(0, 10)}.
      </p>
      {data.releases.map((r) => (
        <details key={r.version} open={r === data.releases[0]}>
          <summary>
            <strong>v{r.version}</strong> — {r.date}
          </summary>
          <pre style={{whiteSpace: 'pre-wrap'}}>{r.notes}</pre>
          <Link href={r.url}>View on GitHub</Link>
        </details>
      ))}
    </>
  );
}

// Unified download list for one board (docs › board › Resource download), built from products.ts and release data.
export function BoardDownloads({board}: {board: Product['id']}): ReactNode {
  const p = getProduct(board);
  const latest = boards[board]?.releases[0];
  const rows: {item: string; where: ReactNode}[] = [
    {
      item: 'OS image',
      where: (
        <>
          {latest ? <>v{latest.version} ({latest.date}) — </> : null}
          <Link to="/software#os-images">Software page</Link> · <Link href={p.resourcesUrl}>InHand Resource Center</Link> (SHA256 next to
          each file)
        </>
      ),
    },
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
    <table className="mo-spec-table">
      <tbody>
        {rows.map((r) => (
          <tr key={r.item}>
            <th scope="row">{r.item}</th>
            <td>{r.where}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Image ↔ firmware ↔ toolchain mapping (GTM task R-02). Fill rows as releases are verified.
const VERSION_ROWS = [
  {board: 'Mo 62A', image: 'v1.1.0 (2026-08-19)', base: 'TI Processor SDK Linux RT EdgeAI 11.01.07.05', tidl: '11_02_17_00', ort: '1.23.0'},
  {board: 'Mo 68A', image: 'V1.0.0', base: 'To be published', tidl: 'To be published', ort: 'To be published'},
];

export function VersionMap(): ReactNode {
  return (
    <div className="mo-table-wrap">
      <table className="mo-spec-table">
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
      </table>
    </div>
  );
}
