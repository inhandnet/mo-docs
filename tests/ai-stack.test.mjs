import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');

test('Mo62A stack evidence distinguishes target imports from TI reference packages', async () => {
  const inventory = JSON.parse(await read('static/downloads/ai/mo62a-v110-stack-inventory.json'));
  assert.equal(inventory.checks.length, 5);
  assert.ok(inventory.checks.every(check => check.exit_code === 0));
  const imports = inventory.checks.find(check => check.name === 'python-runtimes').output;
  const records = imports.split('\n').filter(line => line.startsWith('{')).map(line => JSON.parse(line));
  for (const [module, version] of [['onnxruntime', '1.23.0'], ['tflite_runtime', '2.12.1'],
    ['tvm', '0.18.0'], ['dlr', '1.13.0'], ['numpy', '2.2.4'], ['cv2', '4.10.0']]) {
    assert.equal(records.find(row => row.module === module)?.version, version);
  }
  assert.equal(records.find(row => row.module === 'tidlruntime')?.installed, false);
  const page = await read('docs/mo-62a/resource-download/version-map.mdx');
  assert.ok(page.includes('not a pristine V1.1.0 release-image manifest'));
  assert.ok(page.includes('TFLite 2.12.0 versus 2.12.1 difference is real'));
  assert.doesNotMatch(JSON.stringify(inventory), /10\.5\.\d+\.\d+|user_password|password=/i);
});

test('selected firmware and all five target libraries match exact TI archives', async () => {
  const report = JSON.parse(await read('static/downloads/ai/mo62a-v110-ti-binary-comparison.json'));
  assert.equal(report.ti_release, '11_02_17_00');
  assert.equal(report.comparisons.length, 6);
  assert.equal(new Set(report.comparisons.map(row => row.target_path)).size, 6);
  for (const row of report.comparisons) {
    assert.match(row.ti_sha256, /^[a-f0-9]{64}$/);
    assert.equal(row.board_sha256, row.ti_sha256);
    assert.equal(row.match, true);
  }
  assert.ok(report.archives.every(item => item.url.startsWith('https://software-dl.ti.com/jacinto7/esd/tidl-tools/11_02_17_00/FIRMWARES/AM62A/edgeai/11_1/')));
});

test('camera development links to one setup walkthrough without duplicating it', async () => {
  const page = await read('docs/mo-62a/application-development/camera-and-video.mdx');
  assert.ok(page.includes('first-npu-demo.mdx#1-connect-the-imx219-camera'));
  assert.ok(page.includes('first-npu-demo.mdx#2-initialize-and-check-the-camera'));
  assert.doesNotMatch(page, /mo62a-csi-connect|^## Connect the camera|^sudo init-imx219|^sudo edgeai-demo/m);
  assert.ok(page.includes('io-mode=2 num-buffers=30'));
  assert.ok(page.includes('not the E5010 hardware encoder'));
});
