import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const dataset = new URL('../hardware/products/mo62a/validation/power-thermal/files/mo62a-power-temperature-20261022.json', import.meta.url);
const record = JSON.parse(await fs.readFile(dataset, 'utf8'));
const article = await fs.readFile(new URL('../hardware/products/mo62a/validation/power-thermal/power-and-thermal.en-US.md', import.meta.url), 'utf8');
const svg = await fs.readFile(new URL('../hardware/products/mo62a/images/mo62a-power-temperature-20261022.svg', import.meta.url), 'utf8');

test('power observations preserve all six manual readings and sample windows', () => {
  assert.equal(record.board, 'Mo62A');
  assert.equal(record.date, '2026-10-22');
  assert.deepEqual(record.cases.map(row => row.id), ['P0', 'P1', 'P2', 'P3', 'P4', 'P5']);
  assert.deepEqual(record.cases.map(row => row.manual_meter.power_W), [4.28, 5.406, 5.16, 6.99, 7.344, 8.07]);
  assert.deepEqual(record.cases.map(row => row.samples), [300, 194, 203, 265, 234, 287]);
  assert.deepEqual(record.cases.map(row => row.temperature_max_C), [55.867, 63.114, 56.517, 66.235, 68.495, 69.717]);
  assert.deepEqual(record.cases.map(row => row.last_elapsed_s), [300.003, 197.723, 204.504, 269.978, 247.155, 300.319]);
  for (const row of record.cases) {
    assert.equal(row.manual_meter.measured_at, null);
    assert.equal(row.manual_meter.observed_window_max_power_W, null);
    assert.ok(row.purpose && row.workload);
    assert.match(row.original_log_sha256, /^[a-f0-9]{64}$/);
    const peak = (Math.round(row.temperature_max_C * 100 + 1e-7) / 100).toFixed(2);
    assert.ok(article.includes('| ' + peak + ' |'));
  }
  assert.equal(record.cases[1].normal_supervisor_completion_recorded, false);
});

test('temperature chart and extrema derive from every recorded sample', () => {
  assert.equal((svg.match(/<polyline /g) ?? []).length, 6);
  assert.doesNotMatch(svg, /<script|<image|[\u3400-\u9fff]/);
  for (const row of record.cases) {
    assert.equal(row.samples, row.telemetry.length);
    assert.equal(row.last_elapsed_s, row.telemetry.at(-1)[0]);
    const values = row.telemetry.flatMap(sample => sample.slice(1, 4));
    assert.equal(row.temperature_min_C, Math.min(...values));
    assert.equal(row.temperature_max_C, Math.max(...values));
    for (const [index, sample] of row.telemetry.entries()) {
      assert.equal(sample.length, record.telemetry_columns.length);
      assert.ok(sample.every(Number.isFinite));
      if (index) assert.ok(sample[0] > row.telemetry[index - 1][0]);
    }
    const trace = svg.match(new RegExp('id="trace-' + row.id + '" points="([^"]+)"'))[1].split(' ');
    assert.equal(trace.length, row.samples);
    assert.deepEqual(trace, row.telemetry.map(sample =>
      (110 + sample[0] / 305 * 1140).toFixed(2) + ',' +
      (600 - (Math.max(...sample.slice(1, 4)) - 50) / 25 * 470).toFixed(2)));
  }
});

test('AI, electrical and thermal measurement boundaries stay separate', () => {
  for (const row of record.cases.slice(3)) {
    assert.equal(row.ai_after_60_s.warmup_excluded_s, 60);
    assert.equal(row.ai_after_60_s.mma_utilization_percent, null);
    assert.ok(row.ai_after_60_s.c7x_max_percent <= 100);
    assert.equal(row.model, record.model.id);
  }
  assert.equal(record.cases[5].ai_after_60_s.cpu_mean_percent, 100);
  assert.ok(record.cases[5].ai_after_60_s.usb_fps_approx > 10);
  assert.ok(record.cases[5].ai_after_60_s.csi_fps_approx > 10);
  for (const phrase of ['not time-averaged power', 'not ambient temperatures', 'not necessarily simultaneous',
    'not a separately captured maximum', 'thermal equilibrium', 'No independent accelerator utilization counter',
    'This earlier read-only capture is separate from P0–P5']) assert.ok(article.includes(phrase), phrase);
  assert.doesNotMatch(article, /no such readings were collected|no idle, peak or workload power measurement/);
  assert.doesNotMatch(JSON.stringify(record), /10\.5\.\d+\.\d+|\/home\/|\/tmp\/|password|Bearer /i);
  assert.equal(record.cooling.ambient_temperature_C, null);
  assert.equal(record.meter.accuracy, null);
});
