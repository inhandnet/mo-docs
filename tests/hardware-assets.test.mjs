import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const root = new URL('../', import.meta.url);

test('hardware references keep the English block-diagram redraws', async () => {
  for (const version of ['v10', 'v11']) {
    const svg = await fs.readFile(new URL(`static/img/hardware-development/mo62a-block-${version}-en.svg`, root), 'utf8');
    assert.doesNotMatch(svg, /\p{Script=Han}/u);
    assert.match(svg, /English reference redrawn from schematic sheet 1; consult original PDF/);
    assert.match(svg, /transformer taps|transformer center taps/);
    await assert.rejects(fs.access(new URL(`static/img/hardware-development/mo62a-schematic-${version}.png`, root)), {code: 'ENOENT'});
  }
});

test('hardware guidance preserves compatibility and validation boundaries', async () => {
  const read = file => fs.readFile(new URL(file, root), 'utf8');
  const overview = await read('docs/mo-62a/hardware-development/overview.mdx');
  assert.match(overview, /MCU R5F \/ FreeRTOS/);
  assert.match(overview, /Board key provisioning has not been validated/);
  assert.match(overview, /no default capacity/);
  assert.doesNotMatch(overview, /No board key provisioning or custom RTOS application validated/);
  const interfaces = await read('docs/mo-62a/hardware-development/hardware-interfaces.mdx');
  assert.match(interfaces, /never wire J5 directly to the 5 V rail or GPIO/);
  assert.doesNotMatch(interfaces, /Standard 4-pin PoE HAT/);
  assert.doesNotMatch(interfaces, /mo62a-board-top|mo62a-interface-photo/);
  const mechanical = await read('docs/mo-62a/hardware-development/mechanical.mdx');
  assert.match(mechanical, /whole-model topology validity check did not pass/);
  assert.match(mechanical, /English Mo62A Datasheet V1.0/);
  assert.doesNotMatch(mechanical, /mo62a-mechanical\.png|img\/boards\/mo-62a\.png/);
  const products = await read('src/data/products.ts');
  const start = products.indexOf("id: 'mo-62a'");
  const end = products.indexOf("id: 'mo-68a'");
  assert.ok(start >= 0 && end > start);
  const mo62a = products.slice(start, end);
  assert.match(mo62a, /MCU Cortex-R5F \+ Device Manager Cortex-R5F \(reserved\)/);
  assert.match(mo62a, /datasheetUrl: null/);
  assert.doesNotMatch(mo62a, /standard CSI camera pinout/);
});

test('clockwise connector markers match the Markdown key and unchanged standard image', async () => {
  const svg = await fs.readFile(new URL('static/img/hardware-development/mo62a-connectors-numbered.svg', root), 'utf8');
  assert.doesNotMatch(svg, /\p{Script=Han}/u);
  const payload = svg.match(/data:image\/png;base64,([A-Za-z0-9+/=]+)/)?.[1];
  assert.ok(payload, 'standalone SVG must carry its base image');
  const image = Buffer.from(payload, 'base64');
  const reference = await fs.readFile(new URL('static/img/hardware-development/mo62a-board-top.png', root));
  assert.deepEqual(image, reference);
  assert.equal(createHash('sha256').update(image).digest('hex'), 'afee288a01ac2de5aadf3d1d6e4bb1692bbcdf2e5620b1217915b188962c1fe7');
  assert.match(svg, /original component-side board image/i);
  assert.match(svg, /run clockwise/);
  assert.doesNotMatch(svg, /data-physical-pin=/);
  const markers = [...svg.matchAll(/data-marker="(\d+)" aria-label="([^"]+)"/g)];
  const labels = ['J6', 'J1', 'USB', 'Ethernet', 'J5', 'JP1', '3.5 mm', 'J4', 'HDMI', 'J2', 'USB-C', 'Status indicator', 'S1', 'CON1'];
  assert.equal(markers.length, labels.length);
  const source = await fs.readFile(new URL('docs/mo-62a/hardware-development/hardware-interfaces.mdx', root), 'utf8');
  const key = source.slice(source.indexOf('| Marker |'), source.indexOf('## Camera, fan and debug UART'));
  const rows = key.split('\n').filter(line => /^\| \d{2} \|/.test(line));
  assert.equal(rows.length, labels.length);
  for (const [i, label] of labels.entries()) {
    assert.equal(Number(markers[i][1]), i + 1);
    assert.ok(markers[i][2].includes(label), label);
    assert.ok(rows[i].startsWith(`| ${String(i + 1).padStart(2, '0')} |`));
    assert.ok(rows[i].includes(label), label);
  }
  assert.doesNotMatch(source, /mo62a-connectors-reference/);
});

test('J6 orientation is separate and preserves all 40 physical pin positions', async () => {
  const svg = await fs.readFile(new URL('static/img/hardware-development/mo62a-j6-orientation.svg', root), 'utf8');
  assert.doesNotMatch(svg, /\p{Script=Han}|<image\b|data-marker=/u);
  const pins = [...svg.matchAll(/data-physical-pin="(\d+)"[^>]*><circle cx="(\d+)" cy="(\d+)"[^>]*\/><text[^>]*>(\d+)<\/text>/g)];
  assert.equal(pins.length, 40);
  assert.deepEqual(pins.map(p => Number(p[1])), [
    ...Array.from({length: 20}, (_, i) => 2 * i + 2),
    ...Array.from({length: 20}, (_, i) => 2 * i + 1),
  ]);
  for (let i = 0; i < 20; i++) {
    assert.equal(pins[i][2], pins[i + 20][2], 'both pins share a column');
    assert.ok(Number(pins[i][3]) < Number(pins[i + 20][3]), 'even pin is above odd pin');
    if (i > 0) assert.ok(Number(pins[i][2]) > Number(pins[i - 1][2]), 'numbering increases to the right');
  }
  for (const pin of pins) assert.equal(pin[1], pin[4], 'visible number matches physical pin');
  const source = await fs.readFile(new URL('docs/mo-62a/hardware-development/hardware-interfaces.mdx', root), 'utf8');
  assert.ok(source.indexOf('mo62a-j6-orientation.svg') > source.indexOf('## 40-pin header (J6)'));
  assert.match(source, /\| Position in this view \| Physical numbering \| How to read it \|/);
});

test('schematic modules and board identification preserve source uncertainty', async () => {
  const schematic = await fs.readFile(new URL('docs/mo-62a/hardware-development/schematics.mdx', root), 'utf8');
  for (const heading of ['Power input and sequencing', 'Processor, clocks, reset and boot', 'LPDDR4 and microSD', 'I²C control and EEPROM', 'Wi-Fi and Bluetooth', 'Ethernet and PoE taps', 'USB hub and Type-C connection', 'CSI camera path', 'Display and analogue audio', 'Expansion, cooling, RTC and debug']) {
    assert.ok(schematic.includes('## ' + heading), heading);
  }
  assert.match(schematic, /viewer pages 7 and 8 contain sheets 8 and 7/);
  assert.match(schematic, /not a complete as-built BOM/);
  assert.match(schematic, /unlike the V11 sheets 3\/17/);
  const revisions = await fs.readFile(new URL('docs/mo-62a/hardware-development/hardware-revisions.mdx', root), 'utf8');
  assert.doesNotMatch(revisions, /mo62a-title-v1[01]|<img\b/);
  assert.match(revisions, /examples from that image, not the identity of every shipped board/);
  assert.match(revisions, /does not establish a validated mapping/);
  assert.match(revisions, /Schematic SHA-256:/);
  assert.match(revisions, /No authoritative engineering change notice/);
});

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
