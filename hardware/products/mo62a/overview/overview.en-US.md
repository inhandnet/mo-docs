---
title: "Overview & specifications"
description: "Mo62A hardware specifications, source documents and the boundary between product capabilities and tested workflows."
sidebar_position: 1
---


Mo62A is built on the TI AM62A vision processor. The table below distinguishes product specifications from the selected system image; hardware ratings are not application benchmark results. See [AI benchmarks](/docs/mo-62a/application-development/ai/benchmarks/) for measured inference times and [Real-time cores](/docs/mo-62a/real-time-cores/overview/) for the actual remote-processor ownership.

[![Mo 62A board — component-side top view](/img/boards/mo-62a.png)](/img/boards/mo-62a.png)

## Specifications

<!-- product-specifications:mo-62a -->

## Design reference and validation scope

Use [Schematics](/mo-62a/hardware-development/schematics/#preview-and-connector-references) for the system block diagram and circuit sources, and [Hardware interfaces](/mo-62a/hardware-development/hardware-interfaces/#connector-map) for connector locations. Design diagrams are not checklists of enabled or validated features: the board has no on-board PoE PD/power converter, and the tested system boots from microSD rather than the optional eMMC block in the older schematic.

| Area | Evidence available | Boundary |
|---|---|---|
| Linux system | [First boot](/docs/mo-62a/getting-started/first-boot/) and [system information](/docs/mo-62a/mo-os/using-mo-os/) | Results apply to the documented image and development board |
| AI inference | [Python/C++ APIs](/docs/mo-62a/application-development/ai/inference-apis/), sample models and measured runs | An accelerator TOPS rating is not model FPS |
| Camera | [IMX219 JPEG capture](/docs/mo-62a/application-development/camera-and-video/) | CPU JPEG encode after TI ISP; hardware encode not qualified |
| Expansion | [GPIO, UART5 and PWM loopbacks](/docs/mo-62a/application-development/gpio-and-peripherals/) | No blanket HAT, SPI or external I²C certification |
| Power and cooling | Product ratings and [six measured workloads](/mo-62a/hardware-development/power-and-thermal/) | Manual meter readings and sensor logs, not absolute maximum power or environmental qualification |
| MCU R5F / FreeRTOS | [MCU console](/docs/mo-62a/real-time-cores/mcu-console/), RPMsg, 30 reload cycles and AI coexistence | Validated example on the MCU R5F; DM R5F remains reserved for system management |
| Secure boot | SoC/SDK capabilities and [provisioning guidance](/docs/mo-62a/low-level-development/secure-boot/) | Board key provisioning has not been validated |

Memory capacity is an ordered hardware option: 2 GB (default) or 4 GB, as listed in Datasheet V1.5. Confirm the purchased SKU and use `free -h` to inspect memory visible to Linux; reservations mean this is not a direct reading of fitted DRAM capacity.

## Integration references

- [Hardware interfaces](/mo-62a/hardware-development/hardware-interfaces/): physical pins, voltage, Linux mapping and connector-reference discrepancies.
- [Power & thermal](/mo-62a/hardware-development/power-and-thermal/): supply ratings, measured workloads and live sensor readings.
- [Mechanical](/mo-62a/hardware-development/mechanical/): downloadable assembly STEP, checksum verification, CAD views and the limits of nominal dimensions.
- [Schematics](/mo-62a/hardware-development/schematics/) and [hardware revisions](/mo-62a/hardware-development/hardware-revisions/): verified downloads and identification limits.
- [Compare the boards](/hardware#compare): product-level comparison; verify the target board's own tested workflows before migration.

## Downloads

| Document | Version | Download |
|---|---|---|
| Datasheet | V1.5 | [PDF](/downloads/hardware/mo62a/Mo62A_datasheet_V1.5-20261026.pdf) |

Verify downloads against [SHA-256 checksums](/downloads/hardware/mo62a/SHA256SUMS.txt).

See [Resource download](/docs/mo-62a/resource-download/) for all hardware files and [OS images](/software#os-images) for system images.
