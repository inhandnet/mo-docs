---
title: "Overview & specifications"
description: "Mo 68A specifications."
sidebar_position: 1
---

The Mo 68A is built on the **TI AM68A** vision processor: two Arm Cortex-A72 cores at 2.0 GHz and two C7x DSPs with a deep-learning accelerator for **8 TOPS** of AI inference. It adds a second camera input, 4K60 video encode / decode, USB 3.0 and PCIe 3.0, on the same 85 × 56 mm footprint as the Mo 62A.

![Mo 68A board](/img/boards/mo-68a.png)

### Hardware

| Parameter | Specification |
|---|---|
| Processor | TI AM68A, 2 × Arm Cortex-A72 @ 2.0 GHz |
| AI accelerator | 2 × C7x DSP + deep-learning accelerator, 8 TOPS |
| ISP / vision | On-chip ISP + VPAC (RGB-IR, WDR, LDC) + DMPAC |
| Video | 4K60 H.264 / H.265 encode and decode |
| Memory | LPDDR4, 4 / 8 GB |
| Storage | microSD card |
| Ethernet | 1 × Gigabit Ethernet |
| USB | 4 × USB 3.0 Type-A |
| PCIe | 1 × PCIe 3.0 |
| Display | 1 × mini DisplayPort; up to 2 × 4-lane MIPI DSI |
| Camera | Up to 2 × 4-lane MIPI CSI-2 |
| Audio | I²S via 40-pin header |
| Expansion | 40-pin header: GPIO / I²C / I²S / SPI / UART / PCM, 3.3 V logic |
| Debug | 1 × TTL UART console |
| Fan | 1 × 4-pin fan header (5 V / PWM / GND / TACH) |
| RTC | Yes, with battery backup |

### Wireless

| Parameter | Specification |
|---|---|
| Wi-Fi / Bluetooth | None on board — use a USB adapter (see Accessories) |

### Power & mechanical

| Parameter | Specification |
|---|---|
| Power input | USB Type-C, 5 V / 5 A |
| Power consumption | 25 W max |
| Dimensions / weight | 85 × 56 mm, 53 g |
| Operating temperature | 0 – 50 °C |

### Software

| Parameter | Specification |
|---|---|
| Operating system | Debian 13 (Trixie), Linux kernel 6.12 |
| AI runtime | TI TIDL with ONNX Runtime / TFLite |
| Development | Python, C/C++, OpenCV, GStreamer, NumPy, apt |
| Security | Secure boot, Arm TrustZone, OP-TEE, hardware AES-256, watchdog |

## Mo 68A vs Mo 62A

Choose the Mo 68A for multiple cameras, higher resolution, video recording alongside inference, or PCIe expansion. For a single camera at lower cost, see the [Mo 62A](/mo-62a/hardware-development/overview/).

Datasheet, user manual and hardware interface description: [InHand Resource Center](https://www.inhand.com/en/resources-center/#/IndustrialDigitalization/AISingleBoardComputer/MO68A).
