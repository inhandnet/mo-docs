import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root = new URL('../', import.meta.url);

test('hardware references keep the English block-diagram redraws', async () => {
  for (const version of ['v11']) {
    const svg = await fs.readFile(new URL(`hardware/products/mo62a/images/mo62a-block-${version}-en.svg`, root), 'utf8');
    assert.doesNotMatch(svg, /\p{Script=Han}/u);
    assert.match(svg, /English reference redrawn from schematic sheet 1; consult original PDF/);
    assert.match(svg, /transformer taps|transformer center taps/);
    await assert.rejects(fs.access(new URL(`hardware/products/mo62a/images/mo62a-schematic-${version}.png`, root)), {code: 'ENOENT'});
  }
});

test('published source text does not reintroduce removed branding', async () => {
  for (const directory of ['docs/', 'static/']) {
    for (const file of await fs.readdir(new URL(directory, root), {recursive: true})) {
      if (!/\.(mdx?|txt|json|[cm]?js|tsx?|css|svg|sh|py|ya?ml)$/.test(file)) continue;
      const source = await fs.readFile(new URL(directory + file, root), 'utf8');
      assert.doesNotMatch(source, /raspberry|camera[ -]?v2|树莓派/i, directory + file);
    }
  }
});

test('assembly download has the exact checked ZIP and STEP payload', async () => {
  const dir = new URL('hardware/products/mo62a/files/', root);
  const zip = new URL('Mo62A_3d_model_V1.0-20260409.stp.zip', dir);
  const sums = await fs.readFile(new URL('SHA256SUMS.txt', dir), 'utf8');
  const data = await fs.readFile(zip);
  assert.equal(data.length, 24542271);
  const digest = createHash('sha256').update(data).digest('hex');
  assert.equal(digest, 'bbb27e5b16e253fc991a8df99de0cdf10bcb1a09b442cb23bcf41711a4a0cde6');
  assert.ok(sums.includes(digest + '  Mo62A_3d_model_V1.0-20260409.stp.zip'));
  // Use the standard-library ZIP reader, not an external CAD dependency.
  const result = JSON.parse(execFileSync('python3', ['-c', `
import hashlib,json,sys,zipfile
with zipfile.ZipFile(sys.argv[1]) as archive:
    assert archive.namelist() == ['MO_62A_MB_PCBA_V1_ASM.stp']
    data = archive.read(archive.namelist()[0])
    header = data.split(b'DATA;', 1)[0]
    assert b"(''),('')" in header
    assert b'AUTOMOTIVE_DESIGN' in header
    assert data.rstrip().endswith(b'END-ISO-10303-21;')
    print(json.dumps({'size':len(data),'sha256':hashlib.sha256(data).hexdigest()}))
`, zip.pathname], {encoding: 'utf8'}));
  assert.equal(result.size, 161380954);
  assert.equal(result.sha256, '42871136c3c8c521f21ed779f51368f0e11ba09fee8d7208ef538b293808f6fa');
  assert.ok(sums.includes(result.sha256 + '  MO_62A_MB_PCBA_V1_ASM.stp\n'));
});

test('hardware file lists match their files, names and checksums', async () => {
  for (const board of ['mo62a', 'mo68a']) {
    const dir = new URL(`hardware/products/${board}/files/`, root);
    const list = JSON.parse(await fs.readFile(new URL('files.json', dir), 'utf8'));
    const sums = await fs.readFile(new URL('SHA256SUMS.txt', dir), 'utf8');
    const prefix = board === 'mo62a' ? 'Mo62A' : 'Mo68A';
    for (const f of list.files) {
      assert.match(f.file, new RegExp(`^${prefix}_${f.category}_${f.version}-${f.date.replaceAll('-', '')}\\.[a-z.]+$`));
      const data = await fs.readFile(new URL(f.file, dir));
      assert.equal(data.length, f.bytes, f.file);
      assert.equal(createHash('sha256').update(data).digest('hex'), f.sha256, f.file);
      assert.ok(sums.includes(`${f.sha256}  ${f.file}\n`), f.file);
    }
  }
});

test('certification lists reference published hardware files', async () => {
  for (const board of ['mo62a', 'mo68a']) {
    const list = JSON.parse(await fs.readFile(new URL(`hardware/products/${board}/compliance/certifications.json`, root), 'utf8'));
    const files = JSON.parse(await fs.readFile(new URL(`hardware/products/${board}/files/files.json`, root), 'utf8')).files.map((f) => f.file);
    assert.equal(list.schema_version, 1);
    for (const item of list.items) {
      assert.match(item.id, /^[a-z0-9-]+$/);
      assert.ok(['certified', 'in-progress'].includes(item.status), item.id);
      assert.ok(item.status === 'certified' ? item.files.length > 0 : item.files.length === 0, item.id);
      for (const file of item.files) assert.ok(files.includes(file), file);
    }
  }
});
