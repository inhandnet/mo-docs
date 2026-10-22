import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const routes = JSON.parse(fs.readFileSync(new URL('../src/data/hardware-routes.json', import.meta.url)));
test('all migrated pages keep one-to-one targets and legacy anchors', () => {
  assert.equal(routes.length, 33);
  assert.equal(new Set(routes.map(r => r.route)).size, routes.length);
  for (const record of routes) {
    const source = fs.readFileSync(new URL(`../docs/${record.doc}.mdx`, import.meta.url), 'utf8');
    assert.ok(source.includes(`<HardwareRedirect route="${record.route}" />`));
    for (const anchor of record.anchors) assert.ok(source.includes(`id="${anchor}"`));
    assert.ok(!source.includes('useBaseUrl'), 'migrated pages must not duplicate content/media');
  }
});

test('redirects preserve query/fragment and exclude duplicate search content', () => {
  const component = fs.readFileSync(new URL('../src/components/HardwareRedirect/index.tsx', import.meta.url), 'utf8');
  assert.match(component, /window\.location\.search \+ window\.location\.hash/);
  assert.match(component, /window\.location\.replace\(destination\)/);
  assert.match(component, /<a href=\{href\}>/);
  assert.match(component, /noindex, follow/);
  const wrapper = fs.readFileSync(new URL('../src/theme/DocItem/Content/index.tsx', import.meta.url), 'utf8');
  assert.match(wrapper, /data-pagefind-body=\{hardwareRoutes/);
});
