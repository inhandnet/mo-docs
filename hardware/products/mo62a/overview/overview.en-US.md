---
title: "Overview & specifications"
description: "Mo62A hardware specifications, source documents and the boundary between product capabilities and tested workflows."
sidebar_position: 1
---


Mo62A is built on the TI AM62A74 vision processor, with four Arm Cortex-A53 cores at up to 1.4 GHz and a C7x DSP with Matrix Multiply Accelerator rated at 2 TOPS. These are product specifications, not application benchmark results. See [AI benchmarks](/docs/mo-62a/application-development/ai/benchmarks/) for measured inference times and [Real-time cores](/docs/mo-62a/real-time-cores/overview/) for the actual remote-processor ownership.

[![Mo62A standard component-side product image: 40-pin header along the upper edge, USB and Ethernet on the right; a perspective reference, not an orthographic drawing](/img/hardware-development/mo62a-board-top.png)](/img/hardware-development/mo62a-board-top.png)

### Hardware

| Parameter | Specification |
|---|---|
| Processor | TI AM62A74, 4 × Arm Cortex-A53 up to 1.4 GHz; MCU Cortex-R5F + Device Manager Cortex-R5F (reserved) |
| AI accelerator | C7x DSP + Matrix Multiply Accelerator (MMA), 2 TOPS |
| ISP / vision | On-chip ISP + VPAC (RGB-IR, WDR, LDC) |
| Memory | LPDDR4, 2 / 4 / 8 GB |
| Storage | microSD card |
| Ethernet | 1 × Gigabit Ethernet |
| USB | 4 × USB 2.0 Type-A |
| Display | 1 × micro HDMI |
| Camera | 1 × 4-lane MIPI CSI-2, 22-pin / 0.5 mm FPC; verify cable pinout and contact orientation |
| Audio | 3.5 mm jack; PCM via 40-pin header |
| Expansion | 40-pin header: GPIO / I²C / SPI / UART / PWM / PCM, 3.3 V logic |
| Debug | 1 × TTL UART console (115200 8N1) |
| Fan | 1 × 4-pin fan header |
| RTC | External RTC and battery connector; battery retention not tested |

### Wireless

| Parameter | Specification |
|---|---|
| Wi-Fi | Wi-Fi 5 (802.11ac), dual-band |
| Bluetooth | BLE 4.2 |
| Antenna | On-board snap-on antenna |

### Power & mechanical

| Parameter | Specification |
|---|---|
| Power input | USB Type-C, 5 V / 5 A |
| Power consumption | 25 W maximum rating (not measured workload power) |
| Dimensions / weight | 85 × 56 mm, 47 g |
| Operating temperature | 0 – 50 °C |

### Software

| Parameter | Specification |
|---|---|
| Operating system | Debian 13 (Trixie), Linux kernel 6.12 |
| AI runtime | TI TIDL with ONNX Runtime / TFLite |
| Development | Python, C/C++, OpenCV, GStreamer, NumPy, apt |
| Security | SoC security capabilities; board secure-boot provisioning not validated |

## Design reference and validation scope

Use [Schematics](/mo-62a/hardware-development/schematics/#preview-and-connector-references) for the system block diagram and circuit sources, and [Hardware interfaces](/mo-62a/hardware-development/hardware-interfaces/#locate-the-board-features) for connector locations. Design diagrams are not checklists of enabled or validated features: the board has no on-board PoE PD/power converter, and the tested system boots from microSD rather than the optional eMMC block in the older schematic.

| Area | Evidence available | Boundary |
|---|---|---|
| Linux system | [First boot](/docs/mo-62a/getting-started/first-boot/) and [system information](/docs/mo-62a/mo-os/using-mo-os/) | Results apply to the documented image and development board |
| AI inference | [Python/C++ APIs](/docs/mo-62a/application-development/ai/inference-apis/), sample models and measured runs | A 2 TOPS rating is not model FPS |
| Camera | [IMX219 JPEG capture](/docs/mo-62a/application-development/camera-and-video/) | CPU JPEG encode after TI ISP; hardware encode not qualified |
| Expansion | [GPIO, UART5 and PWM loopbacks](/docs/mo-62a/application-development/gpio-and-peripherals/) | No blanket HAT, SPI or external I²C certification |
| Power and cooling | Product ratings and [read-only sensor capture](/mo-62a/hardware-development/power-and-thermal/) | No measured 25 W draw or environmental qualification |
| MCU R5F / FreeRTOS | [MCU console](/docs/mo-62a/real-time-cores/mcu-console/), RPMsg, 30 reload cycles and AI coexistence | Validated example on the MCU R5F; DM R5F remains reserved for system management |
| Secure boot | SoC/SDK capabilities and [provisioning guidance](/docs/mo-62a/low-level-development/secure-boot/) | Board key provisioning has not been validated |

Memory capacity is an ordered hardware option: 2 GB, 4 GB or 8 GB, with no default capacity specified here. Confirm the purchased SKU and use `free -h` to inspect memory visible to Linux; reservations mean this is not a direct reading of fitted DRAM capacity.

## Integration references

- [Hardware interfaces](/mo-62a/hardware-development/hardware-interfaces/): physical pins, voltage, Linux mapping and connector-reference discrepancies.
- [Power & thermal](/mo-62a/hardware-development/power-and-thermal/): supply ratings and live sensor readings.
- [Mechanical](/mo-62a/hardware-development/mechanical/): downloadable assembly STEP, checksum verification, CAD views and the limits of nominal dimensions.
- [Schematics](/mo-62a/hardware-development/schematics/) and [hardware revisions](/mo-62a/hardware-development/hardware-revisions/): verified downloads and identification limits.
- [Compare the boards](/hardware#compare): product-level comparison; verify the target board's own tested workflows before migration.

## Downloads

- [English datasheet — InHand Resource Center](https://www.inhand.com/en/resources-center/#/IndustrialDigitalization/AISingleBoardComputer/MO62A)
- [Schematics](/mo-62a/hardware-development/schematics/)
- [OS images](/software#os-images)
