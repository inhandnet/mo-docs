import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root = new URL('../', import.meta.url);

test('published source text does not reintroduce removed branding', async () => {
  for (const directory of ['docs/', 'src/', 'static/']) {
    for (const file of await fs.readdir(new URL(directory, root), {recursive: true})) {
      if (!/\.(mdx?|txt|json|[cm]?js|tsx?|css|svg|sh|py|ya?ml)$/.test(file)) continue;
      const source = await fs.readFile(new URL(directory + file, root), 'utf8');
      assert.doesNotMatch(source, /raspberry|camera[ -]?v2|树莓派/i, directory + file);
    }
  }
});

test('assembly download has the exact checked ZIP and STEP payload', async () => {
  const dir = new URL('static/downloads/hardware/mo62a/', root);
  const zip = new URL('MO_62A_MB_PCBA_V1_ASM.stp.zip', dir);
  const sums = await fs.readFile(new URL('SHA256SUMS.txt', dir), 'utf8');
  const data = await fs.readFile(zip);
  assert.equal(data.length, 24542271);
  const digest = createHash('sha256').update(data).digest('hex');
  assert.equal(digest, 'bbb27e5b16e253fc991a8df99de0cdf10bcb1a09b442cb23bcf41711a4a0cde6');
  assert.ok(sums.includes(digest + '  MO_62A_MB_PCBA_V1_ASM.stp.zip'));
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
