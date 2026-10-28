import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read = p => fs.readFileSync(new URL(p, import.meta.url), 'utf8');
const data = JSON.parse(read('../hardware/products/mo68a/validation/power-thermal/files/mo68a-power-temperature-20261028.json'));
const article = read('../hardware/products/mo68a/hardware-development/power-and-thermal.en-US.md');
test('Mo68A preserves reported power and every thermal sample', () => {
  assert.deepEqual(data.cases.map(r => r.id), ['P0','P1','P2','P3','P4','P5','P6','P7']);
  assert.deepEqual(data.cases.map(r => r.manual_meter.power_W), [9.997,12.454,11.183,13.422,13.870,14.736,15.026,15.486]);
  assert.deepEqual(data.cases.map(r => r.samples), [299,293,297,293,281,285,302,303]);
  assert.deepEqual(data.cases.map(r => r.temperature_max_C), [74.336,87.037,75.524,88.338,90.365,93.818,101.757,97.740]);
  for (const r of data.cases) {
    assert.equal(r.telemetry.length,r.samples);
    assert.equal(r.last_elapsed_s,r.telemetry.at(-1)[0]);
    const temperatures = r.telemetry.flatMap(t => t.slice(1,8));
    assert.equal(r.temperature_max_C, Math.max(...temperatures));
    assert.equal(r.temperature_min_C, Math.min(...temperatures));
    r.telemetry.forEach((t,i) => {
      assert.equal(t.length,data.telemetry_columns.length);
      assert.ok(t.every(v => v === null || Number.isFinite(v)));
      if (i) assert.ok(t[0] > r.telemetry[i-1][0]);
      for (const c of t.slice(8,11)) assert.ok(c >= 0 && c <= 100);
    });
    assert.equal(r.after_60s.mma_utilization_percent,null);
    assert.equal(r.manual_meter.measured_at,null);
    assert.equal(r.manual_meter.observed_window_max_power_W,null);
    assert.match(r.original_log_sha256,/^[a-f0-9]{64}$/);
    assert.ok(article.includes(`| ${r.temperature_max_C.toFixed(2)} |`));
  }
});
test('Mo68A separates inference, DSP busy-time and measurement limits', () => {
  assert.equal(data.firmware,'1.0.2');
  assert.equal(data.ambient_temperature_after_relocation_C,null);
  assert.equal(data.meter.accuracy,null);
  assert.deepEqual(data.cases.slice(3,6).map(r=>r.app_exit_code),[-9,-9,-9]);
  assert.deepEqual(data.cases.slice(6).map(r=>r.app_exit_code),[0,0]);
  for (const r of data.cases.slice(6)) for (const d of Object.values(r.after_60s.dsp_load_percent)) assert.ok(d.mean > 94 && d.max <= 100);
  assert.ok(data.cases[7].after_60s.flow_throughput.USB.completed_frame_rate_fps < 30);
  assert.doesNotMatch(JSON.stringify(data), /10\.5\.\d+\.\d+|\/home\/|\/tmp\/|password|Bearer /i);
  for (const phrase of ['not time-averaged power','not establish the absolute maximum','not the inputs','105 °C test cutoff','not resolve earlier preflight freezes','V1.0.0']) assert.ok(article.includes(phrase),phrase);
});
