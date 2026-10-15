import React, {useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';

type Result = {url: string; excerpt: string; meta: {title: string}; filters?: {product?: string[]}};
type SearchAPI = {search: (query: string, options?: {filters?: {product: string}}) => Promise<{results: {id: string; data: () => Promise<Result>}[]}>; filters: () => Promise<Record<string, Record<string, number>>>};
function plainText(html: string) { return new DOMParser().parseFromString(html, 'text/html').body.textContent ?? ''; }

export default function SearchBar() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const api = useRef<Promise<SearchAPI> | null>(null);
  const script = useBaseUrl('/pagefind/pagefind.js');
  const [query, setQuery] = useState('');
  const [product, setProduct] = useState('');
  const [products, setProducts] = useState<string[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [message, setMessage] = useState('Search product guides and reference pages.');
  const [open, setOpen] = useState(false);
  function show() { dialog.current?.showModal(); setOpen(true); input.current?.focus(); }
  function close() { dialog.current?.close(); setOpen(false); trigger.current?.focus(); }
  function load() {
    api.current ??= import(/* webpackIgnore: true */ script).catch(error => { api.current = null; throw error; });
    return api.current!;
  }
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); show(); }
    };
    document.addEventListener('keydown', keydown);
    return () => document.removeEventListener('keydown', keydown);
  }, []);
  useEffect(() => {
    if (!open) return;
    let stale = false;
    const timer = setTimeout(async () => {
      if (!query.trim()) { setResults([]); setMessage('Search product guides and reference pages.'); return; }
      setMessage('Searching…');
      try {
        const search = await load();
        const filters = await search.filters();
        const response = await search.search(query, product ? {filters: {product}} : undefined);
        const items = await Promise.all(response.results.slice(0, 20).map(r => r.data()));
        if (stale) return;
        setProducts(Object.keys(filters.product ?? {}));
        setResults(items);
        setMessage(response.results.length ? `${response.results.length} results${response.results.length > 20 ? ' · first 20 shown' : ''}` : 'No results. Try another term or product filter.');
      } catch {
        if (!stale) { setResults([]); setMessage('Search index unavailable. For local development, run npm run build and npm run serve to use full-text search.'); }
      }
    }, 180);
    return () => { stale = true; clearTimeout(timer); };
  }, [query, product, open, script]);
  return <>
    <button ref={trigger} className="search-trigger" onClick={show} aria-label="Search documentation"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span>Search</span><kbd>⌘ K</kbd></button>
    <dialog ref={dialog} className="search-dialog" aria-labelledby="search-title" onCancel={() => { setOpen(false); trigger.current?.focus(); }} onClick={e => { if (e.target === dialog.current) close(); }}>
      <div className="search-panel"><div className="search-heading"><h2 id="search-title">Search documentation</h2><button onClick={close} aria-label="Close search">✕</button></div>
        <label className="sr-only" htmlFor="docs-search">Search terms</label><input id="docs-search" ref={input} type="search" placeholder="Search guides, downloads, configuration…" value={query} onChange={e => setQuery(e.target.value)} autoComplete="off" />
        <div className="search-tools"><label htmlFor="search-product">Product</label><select id="search-product" value={product} onChange={e => setProduct(e.target.value)}><option value="">All documentation</option>{products.map(p => <option key={p}>{p}</option>)}</select><span>Esc to close</span></div>
        <p role="status" className="search-status">{message}</p>
        <ul className="search-results">{results.map(r => <li key={r.url}><Link to={r.url} onClick={close}><small>{r.filters?.product?.join(' · ')}</small><strong>{r.meta.title}</strong><p>{plainText(r.excerpt)}</p></Link></li>)}</ul>
      </div>
    </dialog>
  </>;
}
