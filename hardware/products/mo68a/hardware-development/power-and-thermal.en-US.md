---
title: "Power and thermal"
description: "Mo 68A supply requirements and eight measured CPU, DSP and camera workloads."
sidebar_position: 3
---

## Supply and cooling

[Mo 68A Datasheet V1.1](/downloads/hardware/mo68a/Mo68A_datasheet_V1.1-20261026.pdf) specifies **USB-C 5 V / 5 A DC**, **25 W maximum**, and **0–50 °C operating ambient**. The 25 W rating is not the result of the measurements below. Size the supply and peripheral budget for the complete system.

Use the active cooler and leave its airflow unobstructed. The J7 fan connector is 5 V / PWM / GND / TACH on pins 1–4; see [Hardware interfaces](../hardware-interfaces/). The kernel controls fan speed automatically. Sensor temperatures are on-chip readings, not ambient temperature or a new operating rating.

## Measurement setup — 28 October 2026

Eight sequential workloads were observed for approximately five minutes each. An operator read V/A/W from the USB-C input power meter after at least one minute; software logged both CPU cores, all seven thermal zones and fan state at a nominal one-second interval. DSP busy time came from TI performance statistics. These instruments are not synchronized, so a reported power value and the highest logged temperature are not necessarily simultaneous.

The tested installation reports version **1.0.2**, TI SDK **11.01.00.03** and TIDL **11_01_06_00**. An isolated, matching TI AI runtime, official models and camera plugins were deployed for this experiment. This is distinct from the Resource Center's public V1.0.0 image. Two Cortex-A72 cores, an active fan, keyboard/mouse, a UGREEN USB camera and an IMX219 CSI camera were attached. The monitor had an independent power supply.

The operator reported 15–20 °C ambient before P3. The equipment was then moved; the new ambient temperature was not reported. The cooler was reported as the same fan specification used with Mo 62A; heatsink contact and enclosure configuration were not recorded. P3–P5 used a 1024 × 600 DP canvas. Different starting temperatures, relocation and display changes limit comparisons between runs and with Mo 62A.

### Workloads

| Case | Workload |
|---|---|
| P0 | Idle, peripherals attached, cameras not streaming, display login screen |
| P1 | Two CPU cores running pinned SHA-256 workers at normal priority |
| P2 | USB MJPEG 1280 × 720 at 30 fps, software JPEG decode, discard output |
| P3 | USB 720p30, official YOLOX-S-Lite 8220 inference, detection overlay and DP display |
| P4 | P3 plus two pinned SHA-256 workers at normal priority |
| P5 | USB 720p30 plus IMX219 1080p RAW8/ISP, two 8220 inference streams and DP mosaic, two nice-19 SHA-256 workers |
| P6 | C7x_1: official SSD-ResNet34 8000 at 1200 × 1200; C7x_2: 7 × 7 convolution at 1920 × 1080; two CPU NEON workers |
| P7 | P6 plus independent USB 1080p MJPEG capture/decode (60 fps requested) and IMX219 1080p ISP/720p scaling (30 fps requested) |

P3–P5 used TI's official AM68A YOLOX-S-Lite 8220 model (640 × 640, COCO, 283/283 nodes offloaded). P5's two camera streams shared the C7x_1/MMA inference path; they did not use one DSP per camera. The AM68A has two C7x DSPs and one MMA, not two equivalent TIDL/MMA inference engines.

P6/P7 added actual computation on both DSPs: official SSD-ResNet34 model 8000 on C7x_1/MMA (1200 × 1200, 176/176 nodes offloaded), and 7 × 7 image convolution on C7x_2. Two NEON arithmetic workers loaded the CPUs. Inputs varied deterministically; convolution output was checked pixel by pixel and inference outputs were checked for finite values. P7 camera capture/decode/ISP ran independently: those camera frames were not the inputs to the synthetic inference workload.

### Meter readings and temperatures

The power values preserve the operator's displayed precision. They are **not time-averaged power or captured instantaneous peaks**. Highest sensor is the maximum across every recorded sample and all seven zones, rounded to two decimals.

| Case | Voltage (V) | Current (A) | Power (W) | Highest sensor (°C) |
|---|---|---|---|---|
| P0 | 5.049 | 1.979 | 9.997 | 74.34 |
| P1 | 5.024 | 2.479 | 12.454 | 87.04 |
| P2 | 5.036 | 2.220 | 11.183 | 75.52 |
| P3 | 5.129 | 2.616 | 13.422 | 88.34 |
| P4 | 5.129 | 2.704 | 13.870 | 90.36 |
| P5 | 5.132 | 2.871 | 14.736 | 93.82 |
| P6 | 5.134 | 2.926 | 15.026 | 101.76 |
| P7 | 5.136 | 3.015 | 15.486 | 97.74 |

**15.486 W (P7) is the highest reported meter reading in this session.** It does not establish the absolute maximum board power. P6 recorded the highest sensor temperature, 101.757 °C; P7 reached 97.740 °C. The runs had different starting conditions and are not a controlled thermal comparison.

### CPU, DSP and throughput

The following summaries exclude the first 60 seconds. CPU busy is across both CPU cores; each DSP column is that core's mean busy time. Busy time is not an independent measurement of MMA arithmetic utilization. A dash means no DSP statistic was collected for that case, not a measured zero.

| Case | CPU busy | C7x_1 | C7x_2 | Measured throughput |
|---|---|---|---|---|
| P0 | 1.58% | — | — | — |
| P1 | 100.00% | — | — | — |
| P2 | 14.97% | — | — | USB software decode ≈30 fps |
| P3 | 65.08% | 43.08% | 0.00% | USB detection 29.93 fps |
| P4 | 99.98% | 25.69% | 0.00% | USB detection 17.13 fps |
| P5 | 99.96% | 55.69% | 0.00% | USB detection 18.32 fps; CSI detection 18.32 fps |
| P6 | 100.00% | 95.03% | 97.99% | 2.74 inference calls/s; 19.44 convolutions/s |
| P7 | 99.88% | 96.74% | 94.92% | 2.45 inference calls/s; 16.72 convolutions/s; USB decode 24.84 fps; CSI ISP 29.97 fps |

P7 requested 1080p60 from the USB camera, but completed software decode averaged **24.84 fps**. The CSI pipeline averaged **29.97 fps**. Requesting 60 fps does not establish 60 completed frames per second. P3–P5 throughput counts frames completing postprocessing and entering the display pipeline; P7 counts a separate camera-processing path. They are different metrics.

[![Recorded hottest-sensor temperature and CPU busy traces for eight Mo 68A workloads](/img/hardware-development/mo68a-power-temperature-20261028.svg)](/img/hardware-development/mo68a-power-temperature-20261028.svg)

Each trace starts at its own workload start. The chart uses the recorded samples without smoothing or extrapolation; it has no power curve. P0–P5 use runner telemetry (299, 293, 297, 293, 281 and 285 samples). P6/P7 use independent nominal 1 Hz telemetry slices (302 and 303 samples); DSP statistics still come from the workload runner. Scheduling and I/O cause small interval variations.

Download the [measurement record with all temperature, CPU and fan samples (JSON)](/downloads/hardware/mo68a-power-temperature-20261028.json). It keeps manual meter readings separate from software telemetry, includes source-log checksums and exact sensor extrema, and omits connection details and terminal sessions. Missing fan PWM readings are null, not zero.

### Completion and limits

P3–P5 completed the observation window, but their AI applications required the timeout supervisor's final kill during shutdown (exit −9). Independent closeout checks confirmed the applications and cameras were released and the desktop returned. P2's cleanup reported an error because the camera driver normalized an unsupported initial frame interval; an independent check confirmed capture stopped. P6/P7 exited normally with validation checks passing. Final checks found the tested system libraries and remote-processor firmware unchanged, and no reboot during P3–P7. These facts do not resolve earlier preflight freezes or prove long-term stability.

P0 used an 80 °C test guard; subsequent accepted runs used a **105 °C test cutoff** and fan-operation monitoring. No accepted run reached its cutoff. This was an experiment limit, not a recommendation to operate continuously at 105 °C or a change to the published ambient range. No thermal-equilibrium, model-accuracy, all-peripheral-load or transient-peak qualification was performed. Screen visibility of both P5 detection streams was not independently confirmed.

For enclosure and supply design, repeat the intended workload at the final ambient temperature, cooling, scene and peripheral configuration, and measure startup and transient peaks with suitable instrumentation.

## Read temperature and fan state

Discover sensor names instead of assuming device indices remain fixed. The following loop reads once per second; stop with Ctrl+C. Temperature values are millidegrees Celsius and PWM values are raw control values.

```bash
while true; do
  date -Iseconds
  for zone in /sys/class/thermal/thermal_zone*; do
    printf '%s ' "$(cat "$zone/type")"
    cat "$zone/temp"
  done
  for sensor in /sys/class/hwmon/hwmon*; do
    [ -r "$sensor/fan1_input" ] || continue
    cat "$sensor/name" "$sensor/fan1_input"
    [ ! -r "$sensor/pwm1" ] || cat "$sensor/pwm1"
  done
  sleep 1
done
```

Keep the system fan governor enabled. These sensor readings alone do not measure the power input.
