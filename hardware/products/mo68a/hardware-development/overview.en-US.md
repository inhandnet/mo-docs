---
title: "Overview & specifications"
description: "Mo 68A hardware specifications, configuration, measured workflows and design references."
sidebar_position: 1
---

The Mo 68A is built on the **TI AM68A** vision processor: two Arm Cortex-A72 cores at 2.0 GHz and two C7x DSPs and one Matrix Multiply Accelerator (MMA), TI's deep-learning accelerator, for **8 TOPS** of AI inference. It adds a second camera input, 4K60 video encode / decode, USB 3.0 and PCIe 3.0, on the same 85 × 56 mm footprint as the Mo 62A.

[![Mo 68A board — component-side top view](/img/boards/mo-68a.png)](/img/boards/mo-68a.png)

## Specifications

### Hardware

| Parameter | Specification |
|---|---|
| Processor | TI AM68A, 2 × Arm Cortex-A72 @ 2.0 GHz |
| AI accelerator | 2 × C7x DSP + MMA, 8 TOPS |
| ISP / vision | On-chip ISP + VPAC (RGB-IR, WDR, LDC) + DMPAC |
| Video | 4K60 video codec |
| Memory | LPDDR4, 4 / 8 GB (8 GB default); models Mo68A-4G-DC / Mo68A-8G-DC |
| Storage | microSD card |
| Ethernet | 1 × Gigabit Ethernet |
| USB | 4 × USB 3.0 Type-A |
| PCIe | 1 × PCIe 3.0 |
| Display | 1 × mini DisplayPort; up to 2 × 4-lane MIPI DSI |
| Camera | Up to 2 × 4-lane MIPI CSI-2 |
| Audio | I²S via 40-pin header |
| Expansion | 40-pin header: GPIO / I²C / I²S / SPI / UART / PCM, 3.3 V logic; check pinout and software support |
| Debug | 1 × TTL UART console |
| Fan | 1 × 4-pin fan header (5 V / PWM / GND / TACH) |
| Button | 1 × Reset button |
| LEDs | PWR, STATUS |
| RTC | Yes, with battery backup |

### Wireless

| Parameter | Specification |
|---|---|
| Wi-Fi / Bluetooth | None on board — use a USB adapter (see Accessories) |

### Power & mechanical

| Parameter | Specification |
|---|---|
| Power input | USB Type-C, 5 V / 5 A |
| Power consumption | 25 W maximum rating (not measured workload power) |
| Cooling | Active fan (optional); 4-pin fan connector |
| Dimensions / weight | 85 × 56 mm, 53 g |
| Operating temperature | 0 – 50 °C |
| Storage temperature | -20 – 70 °C |

### Software

| Parameter | Specification |
|---|---|
| Operating system | Debian 13 (Trixie), Linux kernel 6.12 |
| AI runtime | TI TIDL with ONNX Runtime / TFLite |
| Development | Python, C/C++, OpenCV, GStreamer, NumPy, apt |
| Security capabilities | Secure boot, Arm TrustZone, OP-TEE, hardware AES-256; provisioning and enforcement require validation |

Specifications follow [Mo 68A Datasheet V1.1](/downloads/hardware/mo68a/Mo68A_datasheet_V1.1-20261026.pdf). Datasheet, user manual and hardware interface description: [InHand Resource Center](https://www.inhand.com/en/resources-center/#/IndustrialDigitalization/AISingleBoardComputer/MO68A).

## Design reference and validation scope {#configuration-and-measured-behavior}

The currently listed **Mo68A-4G-DC** and **Mo68A-8G-DC** variants configure **MIPI0 as DSI** and **MIPI1 as CSI**. The maximum interface capabilities above do not mean two CSI cameras and two DSI displays are available simultaneously. Schematic V1.1 uses resistor population to select the MIPI routing; a software overlay cannot change an unconnected hardware path.

The AM68A includes one C7x/MMA inference path plus a second C7x DSP. In the [power and thermal measurements](../power-and-thermal/), two camera inference streams shared the first path. A separate convolution workload exercised the second DSP. These observations do not establish maximum AI throughput.

The security entries are published product capabilities. Customer-key provisioning and enforcement of authenticated boot have not been validated for this documentation. The public Debian V1.0.0 image is linked on [Software](/software#mo-68a-images); the power-test installation separately reported 1.0.2.

| Area | Evidence available | Boundary |
|---|---|---|
| Linux system | Public Debian image and separately recorded power-test installation | Test installation 1.0.2 is not qualification of public image V1.0.0 |
| AI inference | Official TI models and load/throughput observations in [Power & thermal](../power-and-thermal/) | Two C7x cores do not imply two equivalent TIDL/MMA engines |
| Camera and display | USB + IMX219 capture, ISP and DP output in the power experiment | Does not qualify two CSI cameras, DSI operation or every sensor mode |
| Expansion | Source connector assignments and J11 pinout | No blanket HAT, PCIe or GPIO/peripheral qualification |
| Power and cooling | Eight recorded workloads with manual input-meter readings and temperature logs | Not absolute maximum power, thermal equilibrium or environmental qualification |
| Security | Published SoC/SDK capabilities | Customer-key provisioning and authenticated-boot enforcement are not validated here |

## Integration references

- [Hardware interfaces](../hardware-interfaces/): connector assignments, MIPI routing and source discrepancies.
- [Power & thermal](../power-and-thermal/): supply ratings, measured workloads and live sensor readings.
- [Mechanical](../mechanical/): dimensions, STEP model and enclosure integration.
- [Schematics](../schematics/) and [Hardware revisions](../hardware-revisions/): design files and board identification.
- [Compare the boards](/hardware#compare): product-level comparison; verify each board's own tested workflows before migration.

## Downloads

| Document | Version | Download |
|---|---|---|
| Datasheet | V1.1 | [PDF](/downloads/hardware/mo68a/Mo68A_datasheet_V1.1-20261026.pdf) |

Verify downloads against [SHA-256 checksums](/downloads/hardware/mo68a/SHA256SUMS.txt).

See [Resource download](/docs/mo-68a/resource-download/) for all hardware files and [OS images](/software#os-images) for system images.
