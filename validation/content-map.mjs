import fs from 'node:fs';
import path from 'node:path';

function relativePath(value) {
  return typeof value === 'string' && value.length > 0 && !value.includes('\\') &&
    !value.startsWith('/') && !value.split('/').some(part => part === '..' || part === '.' || !part);
}

export function validateContentMap(root, map) {
  if (map.schema_version !== 1 || !Array.isArray(map.routes) || !Array.isArray(map.assets)) {
    throw new Error('Unsupported content-map schema.');
  }
  const output = new Set(['docs/index.md', 'docs/mo-62a/index.md', 'docs/mo-68a/index.md']);
  const routes = new Set(['', 'mo-62a/', 'mo-68a/']);
  function source(name) {
    if (!relativePath(name)) throw new Error(`Invalid source path: ${name}`);
    const file = path.resolve(root, name);
    const real = fs.realpathSync(file);
    if (!real.startsWith(fs.realpathSync(root) + path.sep) || !fs.lstatSync(file).isFile()) {
      throw new Error(`Source must be a regular repository file: ${name}`);
    }
  }
  function unique(name) {
    if (output.has(name)) throw new Error(`Duplicate output path: ${name}`);
    output.add(name);
  }
  for (const entry of map.routes) {
    source(entry.source);
    if (!entry.source.endsWith('.md')) throw new Error('Page sources must be Markdown.');
    if (!/^(?:[a-z0-9-]+\/)+$/.test(entry.route) || routes.has(entry.route)) {
      throw new Error(`Invalid or duplicate route: ${entry.route}`);
    }
    routes.add(entry.route);
    if (!relativePath(entry.original) || !entry.original.startsWith('docs/') || !entry.original.endsWith('.mdx')) {
      throw new Error(`Invalid document identity: ${entry.original}`);
    }
    unique(entry.original.replace(/\.mdx$/, '.md'));
    const text = fs.readFileSync(path.join(root, entry.source), 'utf8');
    if (!/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/.test(text)) throw new Error(`Missing page front matter: ${entry.source}`);
  }
  for (const entry of map.assets) {
    source(entry.source);
    if (!relativePath(entry.target) || !/^(img|downloads)\//.test(entry.target)) {
      throw new Error(`Invalid asset target: ${entry.target}`);
    }
    unique(`static/${entry.target}`);
  }
  return map;
}
