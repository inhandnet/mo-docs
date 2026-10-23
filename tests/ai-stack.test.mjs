import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, readdir} from 'node:fs/promises';

const read = file => readFile(new URL('../' + file, import.meta.url), 'utf8');

test('operator evidence separates workbook results from complete model validation', async () => {
  const page = await read('docs/mo-62a/application-development/ai/known-issues.mdx');
  for (const text of ['Operator_Test_Report_AM62A_8bits.xlsx', 'Operator_Test_Report_AM62A_16bits.xlsx',
    'Open `Versions` first', 'output-accuracy failure', 'not a lossless conversion',
    'An operator test does not validate a complete detector',
    'editing generated TIDL binaries is not a training workflow']) {
    assert.ok(page.includes(text), text);
  }
});

test('model workflow keeps architecture, training, compilation and application boundaries explicit', async () => {
  const page = await read('docs/mo-62a/application-development/ai/compile-your-own-model.mdx');
  for (const text of ['Keep architecture and weights matched',
    'before ONNX export and TIDL compilation', 'New business classes may require training',
    '326/326 nodes', '32 actual frames, three iterations',
    'not included in the tested image', 'not ground truth',
    '--compare host-images', 'no division by 255']) {
    assert.ok(page.includes(text), text);
  }
  for (const name of ['index', 'tutorial-yolo']) {
    const content = await read('docs/mo-62a/application-development/ai/' + name + '.mdx');
    assert.ok(content.includes('#keep-architecture-and-weights-matched'));
  }
});

test('first-release public content excludes deferred model research', async () => {
  async function inspect(directory) {
    for (const entry of await readdir(new URL('../' + directory, import.meta.url), {withFileTypes: true})) {
      const file = directory + '/' + entry.name;
      assert.doesNotMatch(file, /yolo[\s_-]?v?26/i, file);
      if (entry.isDirectory()) await inspect(file);
      else if (/\.(mdx?|json|[cm]?js|tsx?|jsx|svg|txt|css|xml|ya?ml|py)$/i.test(entry.name)) {
        assert.doesNotMatch(await read(file), /yolo[\s_-]?v?26|273\/273|265\/265|87 intermediate activations/i, file);
      }
    }
  }
  for (const directory of ['docs', 'static', 'hardware/products', 'hardware/accessories']) await inspect(directory);
});

test('Mo62A model development pins official TI tools and a complete compatibility baseline', async () => {
  const toolchain = await read('docs/mo-62a/application-development/ai/toolchain.mdx');
  assert.ok(toolchain.includes('https://github.com/TexasInstruments/edgeai-tidl-tools.git'));
  assert.ok(toolchain.includes('d2be7203e5680298d7f54bcbd38e299d1bc22bfd'));
  assert.ok(toolchain.includes('BRANCH=REL.TIDL.11.02.17.00'));
  assert.ok(toolchain.includes('Track upstream without changing the deployment baseline'));
  assert.ok(toolchain.includes('not an identical number on every component'));
  assert.ok(toolchain.includes('Never mix a new graph with an old artifact directory'));
  assert.ok(toolchain.includes('Version skew is one possible cause'));
  for (const name of ['compile-your-own-model', 'tutorial-yolo']) {
    const page = await read('docs/mo-62a/application-development/ai/' + name + '.mdx');
    assert.ok(page.includes('toolchain.mdx#select-a-compatible-combination'));
    assert.ok(page.includes('C7x firmware'));
  }
  const versions = await read('docs/mo-62a/resource-download/version-map.mdx');
  assert.ok(versions.includes('Do not assemble the stack from unrelated releases'));
  assert.ok(versions.includes('same TIDL release'));
  assert.ok(versions.includes('not a pristine V1.1.0 release-image manifest'));
  assert.ok(versions.includes('TFLite 2.12.0 versus 2.12.1 difference is real'));
});

test('camera development links to one setup walkthrough without duplicating it', async () => {
  const page = await read('docs/mo-62a/application-development/camera-and-video.mdx');
  assert.ok(page.includes('first-npu-demo.mdx#1-connect-the-imx219-camera'));
  assert.ok(page.includes('first-npu-demo.mdx#2-initialize-and-check-the-camera'));
  assert.doesNotMatch(page, /mo62a-csi-connect|^## Connect the camera|^sudo init-imx219|^sudo edgeai-demo/m);
  assert.ok(page.includes('io-mode=2 num-buffers=30'));
  assert.ok(page.includes('not the E5010 hardware encoder'));
});
