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
    assert.equal(sections.length, 13, `${board} must include the complete documentation section tree`);
  }
});

test('shared MDX imports and category landing pages exist', async () => {
  // Hardware pages are generated from content/hardware-map.json at build time.
  const generated = new Set(JSON.parse(await fs.readFile(new URL('../content/hardware-map.json', import.meta.url), 'utf8')).routes.map(entry => entry.original));
  for (const file of await fs.readdir(root, {recursive: true})) {
    if (file.endsWith('.mdx')) {
      const source = await fs.readFile(new URL(file, root), 'utf8');
      for (const match of source.matchAll(/from ['"]@site\/docs\/([^'"]+)['"]/g)) await fs.access(new URL(match[1], root));
    } else if (path.basename(file) === '_category_.json') {
      const category = JSON.parse(await fs.readFile(new URL(file, root), 'utf8'));
      if (category.link?.type === 'doc' && !generated.has(`docs/${category.link.id}.mdx`)) await fs.access(new URL(`${category.link.id}.mdx`, root));
    }
  }
});

test('documentation placeholders do not expose planning metadata', async () => {
  for (const file of await fs.readdir(root, {recursive: true})) {
    if (!file.endsWith('.mdx')) continue;
    const content = await fs.readFile(new URL(file, root), 'utf8');
    assert.doesNotMatch(content, /<ComingSoon\b[^>]*\b(?:priority|source)=/, file);
    assert.doesNotMatch(content, /PENDING-(?:VERIFY|MEDIA)/, file);
  }
});

test('repository and website security reporting instructions agree', async () => {
  const policy = (await fs.readFile(new URL('../SECURITY.md', import.meta.url), 'utf8')).replace(/^# [^\n]*\n\s*/, '').trim();
  const page = (await fs.readFile(new URL('security/vulnerability-reporting.mdx', root), 'utf8')).replace(/^---\n[\s\S]*?\n---\n\s*/, '').trim();
  assert.equal(page, policy);
});
