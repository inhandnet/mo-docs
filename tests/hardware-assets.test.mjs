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

test('assembly downloads have the exact checked ZIP and STEP payloads', async () => {
  for (const [board, file, member, zipHash, stepHash, stepBytes] of [
  [
    "mo62a",
    "Mo62A_3d_model_V1.1-20261030.stp.zip",
    "Mo_62A_P_MB_V11.stp",
    "5fe7bb8560e19ca0a1355081c1da23fd7113d2d9be83146149664fa2609439c7",
    "3719f7274b154073737fd89d566c38391904a88e2346be100949089019c95561",
    165752752
  ],
  [
    "mo68a",
    "Mo68A_3d_model_V1.1-20261029.stp.zip",
    "MO_68a_pcb_mb_v1_1.stp",
    "5508feeb726bff5522bc46218d14a2ef97aa8b1fee50b14e034e5580ca63fd34",
    "7619f990f41d433d0e8723e1bedbc5c90011e01316480d1c792a8fcbad7b5205",
    123006892
  ]
]) {
    const dir = new URL(`hardware/products/${board}/files/`, root);
    const zip = new URL(file, dir);
    const sums = await fs.readFile(new URL('SHA256SUMS.txt', dir), 'utf8');
    const digest = createHash('sha256').update(await fs.readFile(zip)).digest('hex');
    assert.equal(digest, zipHash);
    assert.ok(sums.includes(`${digest}  ${file}\n`));
    const result = JSON.parse(execFileSync('python3', ['-c', `
import hashlib,json,sys,zipfile
with zipfile.ZipFile(sys.argv[1]) as archive:
    assert archive.namelist() == [sys.argv[2]]
    assert archive.testzip() is None
    data = archive.read(sys.argv[2])
    assert data.startswith(b'ISO-10303-21;')
    assert b'AUTOMOTIVE_DESIGN' in data.split(b'DATA;', 1)[0]
    assert data.rstrip().endswith(b'END-ISO-10303-21;')
    print(json.dumps({'size':len(data),'sha256':hashlib.sha256(data).hexdigest()}))
`, zip.pathname, member], {encoding: 'utf8'}));
    assert.equal(result.size, stepBytes);
    assert.equal(result.sha256, stepHash);
    assert.ok(sums.includes(`${result.sha256}  ${member}\n`));
  }
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
