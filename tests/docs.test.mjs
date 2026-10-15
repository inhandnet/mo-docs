import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = new URL('../docs/', import.meta.url);
test('documentation contains only Mo boards and their shared resources', async () => {
  const entries = await fs.readdir(root, {withFileTypes: true});
  for (const entry of entries.filter(e => e.isDirectory())) {
    assert.ok(/^mo-[a-z0-9-]+$/.test(entry.name) || ['_partials', 'accessories', 'security', 'works-with-mo'].includes(entry.name), `Out-of-scope documentation: ${entry.name}`);
  }
  for (const board of ['mo-62a', 'mo-68a']) {
    const sections = (await fs.readdir(new URL(`${board}/`, root), {withFileTypes: true})).filter(e => e.isDirectory());
    assert.equal(sections.length, 13, `${board} must retain ZYB's complete section tree`);
  }
});

test('shared MDX imports and category landing pages exist', async () => {
  for (const file of await fs.readdir(root, {recursive: true})) {
    if (file.endsWith('.mdx')) {
      const source = await fs.readFile(new URL(file, root), 'utf8');
      for (const match of source.matchAll(/from ['"]@site\/docs\/([^'"]+)['"]/g)) await fs.access(new URL(match[1], root));
    } else if (path.basename(file) === '_category_.json') {
      const category = JSON.parse(await fs.readFile(new URL(file, root), 'utf8'));
      if (category.link?.type === 'doc') await fs.access(new URL(`${category.link.id}.mdx`, root));
    }
  }
});
