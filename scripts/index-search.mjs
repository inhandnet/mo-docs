import path from 'node:path';
import * as pagefind from 'pagefind';
const outDir = process.argv[2];
if (!outDir) throw new Error('Pass the built site directory');
try {
  const {index, errors} = await pagefind.createIndex({rootSelector: '[data-pagefind-body]', excludeSelectors: ['.theme-edit-this-page', '.pagination-nav', '[data-pagefind-ignore]']});
  if (!index || errors.length) throw new Error(errors.join('\n') || 'Could not create search index');
  const result = await index.addDirectory({path: outDir, glob: '**/index.html'});
  if (result.errors.length) throw new Error(result.errors.join('\n'));
  const output = await index.writeFiles({outputPath: path.join(outDir, 'pagefind')});
  if (output.errors.length) throw new Error(output.errors.join('\n'));
  console.log(`Pagefind indexed ${result.page_count} pages.`);
} finally { await pagefind.close(); }
