import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function checkAllTables(page, root, url) {
  const pages = [];
  async function collect(directory) {
    for (const entry of await fs.readdir(directory, {withFileTypes: true})) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await collect(file);
      else if (entry.name === 'index.html' && (await fs.readFile(file, 'utf8')).includes('<table')) {
        pages.push(path.relative(root, file).replace(/index.html$/, ''));
      }
    }
  }
  await collect(root);
  let tables = 0;
  for (const route of pages) {
    await page.goto(url + route, {waitUntil: 'domcontentloaded'});
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.querySelectorAll('.theme-doc-markdown table')]
      .every(table => table.dataset.sized === 'true'));
    tables += await page.locator('.theme-doc-markdown table').count();
    for (const width of [390, 768, 960, 1280, 1440, 1920]) {
      await page.setViewportSize({width, height: 1000});
      // Allow resize observation and its layout measurement to finish.
      await page.evaluate(() => new Promise(resolve =>
        requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)))));
      const issues = await page.locator('.theme-doc-markdown table').evaluateAll(tables => {
        const issues = [];
        for (const table of tables) {
          if (!table.closest('.mo-table')) issues.push('Unwrapped table');
          for (const cell of table.querySelectorAll('th,td')) {
            if (cell.scrollWidth > cell.clientWidth + 1) {
              issues.push('Cell overflow: ' + cell.textContent.slice(0, 100));
            }
            const walker = document.createTreeWalker(cell, NodeFilter.SHOW_TEXT);
            for (let node; (node = walker.nextNode());) {
              const pattern = node.parentElement.closest('code') ? /\S+/g : /[A-Za-z][A-Za-z0-9_]*/g;
              for (const match of node.textContent.matchAll(pattern)) {
                const range = document.createRange();
                range.setStart(node, match.index);
                range.setEnd(node, match.index + match[0].length);
                const lines = new Set([...range.getClientRects()].map(rect => Math.round(rect.top)));
                if (lines.size > 1) issues.push('Split word: ' + match[0]);
              }
            }
          }
        }
        if (document.documentElement.scrollWidth > innerWidth + 1) issues.push('Page overflow');
        return issues;
      });
      assert.deepEqual(issues, [], `${route || '/'} at ${width}px`);
    }
  }
  console.log(`Table audit passed: ${tables} tables on ${pages.length} pages; intact words and code tokens, no cell/page overflow.`);
}
