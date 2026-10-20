import {useEffect, useRef, type ComponentProps} from 'react';

// CSS owns column proportions; the longest word determines the minimum width.
export default function DocumentationTable(props: ComponentProps<'table'>) {
  const ref = useRef<HTMLTableElement>(null);
  useEffect(() => {
    const table = ref.current;
    if (!table) return;
    let disposed = false;
    let frame = 0;
    const measure = () => {
      if (disposed || !table.rows.length) return;
      const width = table.getBoundingClientRect().width;
      if (!width) return;
      const fractions = Array.from(table.rows[0].cells,
        cell => cell.getBoundingClientRect().width / width);
      let minimum = 0;
      for (const row of Array.from(table.rows)) {
        for (const [index, cell] of Array.from(row.cells).entries()) {
          if (cell.colSpan !== 1 || !fractions[index]) continue;
          const probe = cell.cloneNode(true) as HTMLElement;
          probe.removeAttribute('id');
          probe.setAttribute('aria-hidden', 'true');
          probe.style.cssText = 'position:fixed;left:-100000px;visibility:hidden;display:block;width:min-content!important;min-width:0;max-width:none;';
          table.appendChild(probe);
          minimum = Math.max(minimum, (probe.getBoundingClientRect().width + 1) / fractions[index]);
          probe.remove();
        }
      }
      table.dataset.minimumWidth = `${Math.ceil(minimum)}`;
      table.dataset.layoutGroup = table.closest('.mo-compare-table')
        ? 'comparison' : `${table.rows[0].cells.length}`;
      const peers = Array.from(document.querySelectorAll<HTMLTableElement>(
        `table[data-layout-group="${table.dataset.layoutGroup}"]`));
      const sharedMinimum = Math.max(...peers.map(peer => Number(peer.dataset.minimumWidth)));
      for (const peer of peers) {
        peer.style.setProperty('--mo-table-min-width', `${sharedMinimum}px`);
      }
      table.dataset.sized = 'true';
    };
    const schedule = () => {
      if (disposed) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(table.parentElement!);
    document.fonts.ready.then(schedule);
    window.addEventListener('resize', schedule);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
    };
  }, [props.children]);
  return <div className="mo-table"><table {...props} ref={ref} /></div>;
}
