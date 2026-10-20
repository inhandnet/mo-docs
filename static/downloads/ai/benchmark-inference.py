#!/usr/bin/env python3
"""Measure synchronous ONNX Runtime calls with blank input, not accuracy or video FPS."""
import argparse
import hashlib
import json
import platform
import statistics
import time
from pathlib import Path

import numpy as np
import onnxruntime as ort

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("model_dir", type=Path)
parser.add_argument("--runs", type=int, default=100)
parser.add_argument("--warmup", type=int, default=5)
parser.add_argument("--output", type=Path, required=True)
args = parser.parse_args()
if args.runs < 2 or args.warmup < 1 or args.output.exists():
    parser.error("Need runs >= 2, warmup >= 1 and a new output file")
models = list((args.model_dir / "model").glob("*.onnx"))
if len(models) != 1:
    parser.error("Model directory must contain exactly one ONNX graph")
if "TIDLExecutionProvider" not in ort.get_available_providers():
    parser.error("TI ONNX Runtime with TIDLExecutionProvider is required")
options = ort.SessionOptions()
options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_DISABLE_ALL
session = ort.InferenceSession(str(models[0]), sess_options=options,
    providers=["TIDLExecutionProvider", "CPUExecutionProvider"],
    provider_options=[{"artifacts_folder": str(args.model_dir / "artifacts")}, {}])
inputs = {}
for item in session.get_inputs():
    if item.type not in ("tensor(uint8)", "tensor(float)") or not all(isinstance(n, int) and n > 0 for n in item.shape):
        raise ValueError("Only static uint8 and float32 inputs are supported")
    inputs[item.name] = np.zeros(item.shape, dtype=np.uint8 if item.type == "tensor(uint8)" else np.float32)
def snapshot():
    return {
        "cpu_khz": Path("/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq").read_text().strip(),
        "temperatures_mC": {p.parent.name: int(p.read_text()) for p in Path("/sys/class/thermal").glob("thermal_zone*/temp")},
    }
for _ in range(args.warmup):
    session.run(None, inputs)
before = snapshot()
times = []
for _ in range(args.runs):
    start = time.perf_counter_ns()
    outputs = session.run(None, inputs)
    times.append((time.perf_counter_ns() - start) / 1e6)
after = snapshot()
if not all(np.isfinite(value).all() for value in outputs):
    raise RuntimeError("Non-finite output")
report = {
    "model": args.model_dir.name, "model_sha256": hashlib.sha256(models[0].read_bytes()).hexdigest(),
    "kernel": platform.release(), "onnxruntime": ort.__version__, "providers": session.get_providers(),
    "input": "all zeros; no accuracy claim", "warmup": args.warmup, "runs": args.runs,
    "scope": "wall-clock synchronous session.run; excludes pre/post-processing and session creation",
    "mean_ms": statistics.mean(times), "median_ms": statistics.median(times),
    "p95_ms": float(np.percentile(times, 95)), "min_ms": min(times), "max_ms": max(times),
    "before": before, "after": after, "samples_ms": times,
}
with args.output.open("x") as handle:
    json.dump(report, handle, indent=2)
print("MODEL", report["model"])
print("RUNS", args.runs, "WARMUP", args.warmup)
print("MEAN_MS %.3f MEDIAN_MS %.3f P95_MS %.3f" % (report["mean_ms"], report["median_ms"], report["p95_ms"]))
print("KERNEL", report["kernel"], "ONNX_RUNTIME", report["onnxruntime"])
print("CPU_KHZ", before["cpu_khz"], after["cpu_khz"])
print("OUTPUT", args.output.name)
print("Blank input: timing only, not accuracy, video FPS or power.")
