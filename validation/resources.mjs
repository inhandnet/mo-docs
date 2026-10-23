const safePath = value => typeof value === 'string' && /^[a-zA-Z0-9_.@/-]+$/.test(value) &&
  !value.startsWith('/') && value.split('/').every(part => part && part !== '.' && part !== '..');

export function validateResourceMap(map) {
  if (map?.schema_version !== 1 || !Array.isArray(map.files) || !Array.isArray(map.bundles)) throw Error('Unsupported resource map');
  const targets = new Set();
  function target(value) {
    if (!safePath(value) || !value.startsWith('downloads/') || targets.has(value)) throw Error(`Invalid or duplicate resource target: ${value}`);
    targets.add(value);
  }
  for (const file of map.files) {
    target(file.target);
    if (!['mo-tools', 'mo-models', 'mo-examples'].includes(file.repository) || !safePath(file.path)) throw Error(`Invalid resource source: ${file.repository}/${file.path}`);
  }
  for (const bundle of map.bundles) {
    target(bundle.target); target(bundle.target + '.sha256');
    if (!bundle.target.endsWith('.tar.gz') || !safePath(bundle.directory) || !bundle.directory.startsWith('downloads/') ||
        !/^[a-zA-Z0-9_-]+$/.test(bundle.prefix) || !map.files.some(file => file.target.startsWith(bundle.directory + '/'))) throw Error(`Invalid resource bundle: ${bundle.target}`);
    if (map.files.some(file => file.target === bundle.directory + '/WEBSITE-SOURCES.json')) throw Error('Bundle provenance filename is reserved');
  }
  return map;
}
