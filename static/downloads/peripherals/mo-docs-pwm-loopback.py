#!/usr/bin/env python3
"""Mo62A EHRPWM0_A pin 33 to GPIO input pin 35: 50 Hz, 25% duty."""
from pathlib import Path
from statistics import median
import time
import gpiod
from gpiod.line import Direction, Edge

chips = [chip for chip in Path("/sys/class/pwm").glob("pwmchip*")
         if "23000000.pwm" in str(chip.resolve())]
if len(chips) != 1:
    raise SystemExit("EHRPWM0 not found; boot microSD-ehrpwm0 first")
chip = chips[0]
pwm = chip / "pwm0"
if pwm.exists():
    raise SystemExit("PWM channel already exported; leave the existing owner undisturbed")

events = []
with gpiod.request_lines("/dev/gpiochip1", consumer="mo-docs-pwm-input", config={
    91: gpiod.LineSettings(direction=Direction.INPUT, edge_detection=Edge.BOTH),
}) as request:
    (chip / "export").write_text("0")
    try:
        (pwm / "period").write_text("20000000")
        (pwm / "duty_cycle").write_text("5000000")
        (pwm / "enable").write_text("1")
        end = time.monotonic() + 2
        while len(events) < 60 and time.monotonic() < end:
            if request.wait_edge_events(timeout=0.2):
                events.extend(request.read_edge_events())
    finally:
        (pwm / "enable").write_text("0")
        (chip / "unexport").write_text("0")

rises = [e.timestamp_ns for e in events if e.event_type == gpiod.EdgeEvent.Type.RISING_EDGE]
periods = [b - a for a, b in zip(rises, rises[1:])]
highs = [b.timestamp_ns - a.timestamp_ns for a, b in zip(events, events[1:])
         if a.event_type == gpiod.EdgeEvent.Type.RISING_EDGE
         and b.event_type == gpiod.EdgeEvent.Type.FALLING_EDGE]
if len(periods) < 10 or len(highs) < 10:
    raise SystemExit(f"FAIL: insufficient edges ({len(events)}); check pins 33 and 35")
period = median(periods)
duty = median(highs) / period * 100
frequency = 1e9 / period
passed = 45 <= frequency <= 55 and 20 <= duty <= 30
print(f"PWM device: {chip.name} (23000000.pwm), channel 0 -> pin 33")
print(f"Capture: gpiochip1 line 91 <- pin 35, {len(events)} edges")
print("Requested: 50.00 Hz, 25.00% duty")
print(f"Measured:  {frequency:.2f} Hz, {duty:.2f}% duty")
print("PASS" if passed else "FAIL")
print("PWM disabled and unexported; GPIO input released")
if not passed:
    raise SystemExit(1)
