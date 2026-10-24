---
title: "Power & thermal"
description: "Mo62A supply ratings, measured workload power and temperature, cooling connections and read-only sensor checks."
sidebar_position: 3
---


## Power supply and measurement boundary

These are published product ratings from page 5 of the English Mo62A Datasheet V1.0 in the [InHand Resource Center](https://www.inhand.com/en/resources-center/#/IndustrialDigitalization/AISingleBoardComputer/MO62A), not measurements from the documentation test bench.

| Item | Published value | Interpretation |
|---|---|---|
| Input | USB Type-C, 5 V | Use a suitable 5 V supply and cable |
| Supply rating | 5 V / 5 A | Check the adapter's 5 V output rating, not just its total wattage |
| Maximum consumption | 25 W | Published rating, not the measured draw of the workloads below |
| Operating temperature | 0–50 °C | Product operating range; not the same quantity as an internal SoC sensor reading |

Include USB devices, camera, fan and any HAT when sizing the supply. J6 pins 2/4 are connected to the 5 V rail; they are not a separate power budget. Do not connect competing power supplies through the header and USB-C. The board has no on-board PoE PD/power converter: J5 exposes transformer taps, not regulated 5 V. PoE operation requires a matching external PD/converter and its approved 5 V/ground connection to J6; see [Hardware interfaces](/mo-62a/hardware-development/hardware-interfaces/#other-connectors).

For an intermittent reset, first test with the recommended supply and a suitable short cable, remove nonessential peripherals after shutting down, and collect the serial boot log. Voltage-drop and power-consumption tests require external measurement equipment. The workload observations below do not replace the recommended supply or its peripheral-power budget.

## Measured workload power and temperature

On October 22, 2026, one Mo62A development installation was observed from idle through dual-camera AI with additional CPU load. The highest reported workload reading was 8.07 W. Use these results as application-planning examples, not guaranteed figures for every board, image or peripheral combination.

**Measurement limits.** Power values are manually read USB-meter display values, not time-averaged power or captured electrical peaks. Temperature values come from three on-chip sensors sampled at approximately 1 Hz; they are not ambient temperatures. No exact timestamp was supplied for the meter readings, so a power value and a temperature maximum in the same row are not necessarily simultaneous. These short runs do not establish thermal equilibrium, sustained operation in an enclosure, a minimum supply rating or absolute maximum board consumption.

### Test environment and electrical boundary

The meter was in series with the USB-C supply. Readings include the board and connected peripherals powered downstream of that meter. They exclude the monitor's separate power supply; this is not bare-board, SoC-only or NPU-only power.

| Item | Recorded condition |
|---|---|
| System | Mo62A V1.1.0 development installation; Debian 13, Linux 6.12.35; not a pristine-image qualification |
| CPU | Four Cortex-A53 cores; performance governor; observed frequency 1.4 GHz |
| AI application | Installed C++ `app_edgeai`, ONNX Runtime 1.23.0 with TIDL EP; GStreamer 1.26.2. No package or firmware changes during testing |
| Cameras | UGREEN Camera 4K over USB; Sony IMX219 over CSI. USB active from P2; CSI active only in P5 and its separate short preflight |
| Other connections | USB keyboard, mouse and flash drive; Ethernet; 3.5 mm headphones; debug UART; Micro HDMI; RTC battery; microSD; 40-pin loopback board; powered fan. Wi-Fi remained connected |
| Back-power checks | UART connected only to TX, RX and GND; the loopback board had no independent power source |
| Peripheral activity | No flash-drive workload, network throughput stress, audio playback or GPIO drive test was added |
| Cooling | Fan running under the existing control policy; PWM was not fixed. Fan model, heatsink details, enclosure configuration and ambient temperature were not recorded |
| Meter | Screen-only USB power meter, read by the operator. Model, accuracy, sampling rate and calibration were not recorded; no meter photograph or recording accompanies these values |
| Board identification | The tested board's fitted-memory SKU and PCB marking were not recorded in this measurement session |

### What each workload tests

P0–P2 kept the HDMI login screen visible. P3–P5 temporarily stopped the login-screen service and used KMS direct display for the application. All listed connections remained in place; the exact time when the CSI module was connected was not separately recorded.

| Case | Purpose | Workload | AI model |
|---|---|---|---|
| P0 | Establish an idle reference with peripherals attached | Cameras not capturing; HDMI login screen; fan and network active | None |
| P1 | Isolate a CPU-intensive workload for comparison | Four pinned workers repeatedly compute SHA-256 over a 1 MiB buffer each; login screen remains visible | None |
| P2 | Measure capture and software-decode overhead | USB MJPEG 1280 × 720 at 30 fps → software JPEG decode → discard; no live camera display | None |
| P3 | Represent a complete single-camera vision application | USB MJPEG 1280 × 720, negotiated 60 fps → decode → preprocess → inference → detection boxes/classes → KMS display | YOLOX-S-Lite 8220, 640 × 640, COCO |
| P4 | Observe competition from simultaneous CPU work | Same single-camera application as P3, plus four pinned SHA-256 workers at normal priority | Same 8220 model and artifacts |
| P5 | Observe combined camera, ISP, AI, display and CPU load | USB plus IMX219 RAW8 1920 × 1080 through TI ISP; two detection streams, KMS mosaic and four pinned workers at low priority (`nice 19`) | Two streams share one 8220 model instance and its artifacts |

P3–P5 used `ONR-OD-8220-yolox-s-lite-mmdet-coco-640x640` with a detection threshold of 0.4. Each launch reported one TIDL subgraph and 329/329 offloaded model nodes. The ONNX SHA-256 is included in the downloadable record; no model was trained or recompiled for this test.

The display canvas was 1920 × 1080. P3/P4 used one 1280 × 720 application view; P5 used two 960 × 540 views. P5's CSI configuration targeted 30 fps, but independent CSI capture FPS was not measured. USB 60 fps in P3–P5 is the device-reported negotiated interval, not the rate of completed inference frames. P2 was explicitly constrained to 30 fps and decoded at approximately 30 fps.

### Meter readings and observed temperature

The final column is the highest sample across all three thermal zones during each recorded run, rounded to two decimals. It is not a temperature rise above ambient, a chip temperature rating, or the temperature at the instant of the meter reading.

| Case | Voltage (V) | Current (A) | Power (W) | Highest sensor (°C) |
|---|---|---|---|---|
| P0 | 5.097 | 0.840 | 4.28 | 55.87 |
| P1 | 5.101 | 1.060 | 5.406 | 63.11 |
| P2 | 5.1 | 1.01 | 5.16 | 56.52 |
| P3 | 5.1 | 1.37 | 6.99 | 66.24 |
| P4 | 5.10 | 1.44 | 7.344 | 68.50 |
| P5 | 5.11 | 1.58 | 8.07 | 69.72 |

Preserve the reported display precision: watts were not recalculated to replace the meter reading. P4 uses the operator's corrected reading. P5's 8.07 W is the highest of the six reported workload values, not a separately captured maximum within its run. No instantaneous-peak or average-power claim is made.

| Case | Telemetry samples | Last sample after workload start (s) | Recorded temperature range (°C) |
|---|---|---|---|
| P0 | 300 | 300.003 | 52.151–55.867 |
| P1 | 194 | 197.723 | 55.216–63.114 |
| P2 | 203 | 204.504 | 53.470–56.517 |
| P3 | 265 | 269.978 | 54.781–66.235 |
| P4 | 234 | 247.155 | 57.810–68.495 |
| P5 | 287 | 300.319 | 55.433–69.717 |

These times describe the logged observation window, not a common five-minute duration or cleanup time. P1 logging ended before normal supervisor completion; its workers were subsequently stopped and their exit verified. P3/P4 ended after the readings were obtained; P5 ran to its approximately 300-second limit. P0's meter reading was reported after its idle telemetry window. The other meter readings were reported in response to the corresponding workload request, without an exact observation time.

[![Six recorded Mo62A temperature traces, with elapsed time reset for each workload; each trace shows the hottest of three on-chip sensors at each sample, without smoothing or extrapolation](/img/hardware-development/mo62a-power-temperature-20261022.svg)](/img/hardware-development/mo62a-power-temperature-20261022.svg)

This chart is plotted from recorded telemetry, not an instrument photograph. Each trace starts at its own workload start; the runs were sequential, with different starting temperatures and variable fan speeds. Lines end at the last recorded sample. No curve was smoothed or extrapolated, and there is no synchronized power curve.

Download the [measurement record and all temperature/CPU/fan samples (JSON)](/downloads/hardware/mo62a-power-temperature-20261022.json). It contains the manually reported V/A/W values separately from the software telemetry, per-run sample counts, exact temperature extrema, model identity, AI summaries and the measurement limitations. Private connection details and raw terminal sessions are not included.

### AI load and useful application throughput

The following averages exclude the first 60 seconds of each AI workload. CPU busy is across all four cores; C7x load comes from a single TI performance collector. No independent MMA utilization counter was available, so these values do not establish that the NPU was fully saturated.

| Case | CPU busy | C7x mean | Application throughput |
|---|---|---|---|
| P3 | 45.11% | 82.08% | Single stream: approximately 20.64 fps |
| P4 | 100% on each core | 64.48% | Single stream: approximately 15.99 fps |
| P5 | 100% on each core | 84.48% | USB: approximately 10.17 fps; CSI: approximately 10.17 fps; combined: approximately 20.34 fps |

Application throughput counts frames that completed postprocessing and were submitted to the output pipeline. It is not monitor refresh rate, glass-to-glass latency or a hardware-only inference timer. P5 uses per-stream counters because the application's global timing intervals overlap across its two inference threads. See [Performance & benchmarks](/docs/mo-62a/application-development/ai/benchmarks/) for the distinction from inference-call timing.

P4 drew 0.354 W more than P3 while application throughput fell by about 22.5%: filling the CPUs did not keep the accelerator equally busy. P5 drew 0.726 W more than P4 and maintained higher C7x load with both cameras active and low-priority CPU workers. P5 also changes the input mix, ISP activity and display-view sizes; this is not a controlled measurement of the effect of priority alone or of one component's power.

Both P5 processing counters continued to advance. A separate operator confirmation or recording of moving images and visible detection boxes was not supplied; these power/load results are not visual acceptance, model-accuracy or industrial-inspection qualification.

### Limits and safe interpretation

Runs were limited to approximately 300 seconds, with an 80 °C sensor cutoff and a fan-operation guard. P5 additionally checked that both streams continued processing. No run reached that temperature cutoff. The cutoff was a conservative test guard, not a new operating-temperature specification.

At the end of P5, the AI application and CPU workers exited, the login screen returned, cameras were released, and the board returned to idle without a reboot or remote-processor reset. Temporary camera formats and controls were restored; the CSI driver retained a color-space-request flag. The persistent CSI configuration was unchanged.

For a product-level maximum-power or thermal claim, also specify the final enclosure, cooling, ambient temperature, supply/cable, peripheral budget, board variant and repeatable scene; run to thermal equilibrium and measure startup/transient peaks with suitable instrumentation. The 4.28–8.07 W observations here do not cover all interface combinations or replace the published supply requirements.

## Cooling and the fan connector

Use cooling appropriate to the workload and enclosure. Keep airflow unobstructed and check operation with the final workload, rather than assuming one temperature sample proves sustained thermal performance.

The schematics identify the 5 V PWM fan connector as J1, SH1.0-4p: pin 1 is 5 V, pin 2 PWM, pin 3 GND and pin 4 tachometer. The older README calls this connector J6; check the actual connector and cable against the schematic.

Locate J1 in the [connector map](/mo-62a/hardware-development/hardware-interfaces/#locate-the-board-features) and consult the [original fan circuit on sheet 17](/mo-62a/hardware-development/schematics/#connector-circuits-sheet-17) before choosing a cable.

Do not write raw PWM sysfs values to experiment with cooling. The fan uses EHRPWM1 at `23010000.pwm`; header pin 36 also has an EHRPWM1 alternate function. Controller indices can change when another overlay is enabled. The [header PWM test](/docs/mo-62a/application-development/gpio-and-peripherals/) uses EHRPWM0 at `23000000.pwm`, not the fan controller.

## Read temperature and fan state

The following commands only read existing attributes. Discover names each time rather than assuming `hwmon3` or `pwmchip0` is stable:

```bash
for zone in /sys/class/thermal/thermal_zone*; do
  printf '%s: ' "${zone##*/}"
  tr '\n' ' ' < "$zone/type"
  cat "$zone/temp"
done

for sensor in /sys/class/hwmon/hwmon*; do
  [ -r "$sensor/fan1_input" ] || continue
  printf '%s: ' "${sensor##*/}"
  cat "$sensor/name"
  for attribute in fan1_input pwm1; do
    [ -r "$sensor/$attribute" ] || continue
    printf '  %s=' "$attribute"
    cat "$sensor/$attribute"
  done
done

for controller in /sys/class/pwm/pwmchip*; do
  printf '%s: ' "${controller##*/}"
  readlink -f "$controller/device"
done
```

[![Live read-only Mo62A inspection: three sensors at about 52 to 53 degrees C, pwmfan at 9990 RPM with raw PWM 109, fan controller at 23010000.pwm and active desktop](/img/hardware-development/mo62a-thermal.png)](/img/hardware-development/mo62a-thermal.png)

In this capture, the three thermal readings were 51709, 52371 and 53250 millidegrees Celsius; `fan1_input` was 9990 RPM and `pwm1` was 109. This earlier read-only capture is separate from P0–P5. These are one-time observations, not a thermal qualification, a fan calibration, or a power reading. `pwm1` is a raw control value, not RPM or degrees Celsius.

For reproducible evaluation, record image version, ambient temperature, enclosure, heatsink/fan, workload, duration, CPU frequency and all thermal zones. The [AI benchmark page](/docs/mo-62a/application-development/ai/benchmarks/) records temperatures at its run boundaries but does not claim long-duration thermal stability.
