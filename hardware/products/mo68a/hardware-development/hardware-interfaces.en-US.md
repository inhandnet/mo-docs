---
title: "Hardware interfaces"
description: "Mo 68A hardware interfaces and source references."
sidebar_position: 2
---

## Locate the connectors

This index combines Mo 68A Datasheet V1.1, User manual V1.0 §§5–17, Hardware Reference Manual V1.0 and [schematic V1.1](../schematics/). Where they differ, the difference is identified below. Use the [component-placement PDF](/downloads/hardware/mo68a/Mo68A_component_placement_V1.1-20260506.pdf) to locate reference designators on the actual board.

| Function | Connector | Electrical / configuration reference |
|---|---|---|
| USB-C power | J5 | 5 V / 5 A DC input; not a general-purpose USB data port |
| Ethernet | J1 | 10/100/1000 Mbps through DP83867 PHY |
| USB peripherals | J2, J3 | Four USB 3.0 Type-A ports via TUSB8041 hub; shared upstream link |
| DisplayPort | J9 | mini DP; use a DP monitor or an active HDMI converter |
| PCIe expansion | J10 | PCIe Gen3 ×1 over a 16-pin FPC; requires matching adapter and power budget |
| MIPI0 / MIPI1 | J24 / J25 | 22-pin, 0.5 mm FPC; CSI/DSI routing depends on populated hardware |
| Expansion | J11 | 40-pin, 2.54 mm pitch; 3.3 V logic, not 5 V tolerant |
| Debug UART | J6 | 3.3 V TTL, 115200 8N1, no flow control; pin-number discrepancy below |
| PWM fan | J7 | 5 V, 4-pin, 1.0 mm pitch; pin order below |
| RTC battery | J8 | Two-pin, 1.0 mm pitch; CR2032 class 3 V cell; polarity discrepancy below |
| PoE expansion | J4 | Ethernet transformer taps for a separate compatible PoE board |
| MicroSD | J23 | Primary boot/storage medium |
| Reset / indicators | SW1 / D1 | Reset button; power/status indicators |

The four USB ports share the hub and supply; four connectors do not imply four independent full-bandwidth links or an unlimited peripheral power budget. Ethernet's transformer tap connector alone is not a PoE power supply.

## 40-pin expansion header

Download the [J11 40-pin pinout PDF](/downloads/hardware/mo68a/Mo68A_pinout_V1.0-20261028.pdf). Physical pin numbering is not a Linux GPIO offset, and a matching 40-pin footprint does not establish software or electrical compatibility with every HAT.

| Interface | Physical pins | SoC connection / note |
|---|---|---|
| 3.3 V / 5 V / ground | See pinout PDF | Power pins are not GPIO; check current budget and back-powering |
| User I²C | 3 SDA, 5 SCL | SOC I²C0 |
| WKUP I²C | 27 SDA, 28 SCL | Shared with power-management devices; do not probe blindly |
| UART | 8 TX, 10 RX | UART5; separate from debug console |
| SPI | 19 MOSI, 21 MISO, 23 CLK, 24 CS0, 26 CS1 | SPI5 |
| I²S | 12 CLK, 35 FS, 38 DIN, 40 DOUT | MCASP0; codec and matching software configuration required |
| PWM-capable pins | 32, 33 | ECAP0 / PWM5_B; availability depends on image and pinmux |
| WKUP GPIO | 11, 15, 22 | Different domain from main GPIOs |

Use only 3.3 V logic on signal pins. Confirm the current device-tree assignment before driving a pin; pinmux capabilities are not a statement that every function is enabled in every image.

## MIPI configuration — check hardware first

The V1.1 schematic sheet 8 labels **MIPI0 / J24 default DSI0** and **MIPI1 / J25 default CSI1**. The current `-DC` SKUs match that arrangement. Resistors select the high-speed routing; the former mux parts were removed in V1.1. A device-tree overlay cannot switch absent physical routing.

The older user manual describes camera overlays on either port and a DSI-on-J24 plus CSI-on-J25 scenario. Apply those instructions only to a compatible physical configuration and matching image. Its J25 DSI software path is marked unavailable. Maximum SoC camera/display counts are not a promise of all modes on a `-DC` board.

Use a compatible 22-pin cable and verify contact orientation before power-on. Do not hot-plug the FPC. The power experiment used one IMX219 CSI stream plus one USB camera; it did not validate two CSI cameras or DSI display operation.

## Fan

The drawn J7 circuit and its labels agree on pins 1–4:

| Pin | Signal |
|---|---|
| 1 | 5 V |
| 2 | PWM |
| 3 | GND |
| 4 | TACH |

The kernel controls fan speed. Keep cooling active during sustained AI/CPU loads; see [Power and thermal](../power-and-thermal/) for measured data and read-only monitoring.

## Debug UART and RTC: source pin-number discrepancies

**J6:** the user manual and schematic silkscreen note say pin 1 RX, pin 2 GND, pin 3 TX. The drawn circuit on schematic V1.1 sheet 18 instead connects pin 1 RX, pin 2 TX and pin 3 GND. This documentation cannot resolve the physical connector numbering from those conflicting sources. Confirm ground and signal positions on the actual board before connecting an adapter. Use 3.3 V TTL, cross adapter TX to board RX, and never connect adapter power to a signal pin. Terminal settings are 115200 baud, 8 data bits, no parity, 1 stop bit, no flow control.

**J8:** the V1.1 drawn circuit connects pin 1 to ground and pin 2 to the battery path through D2; the older hardware-reference table reverses the polarity. A nearby schematic note also calls pin 2 “5V”, although this is the RTC battery connector. Use the specified 3 V CR2032 battery assembly and verify actual connector polarity before insertion; do not treat that note as a 5 V battery requirement.

## Source and software scope

The source manuals are available from the [InHand Resource Center](https://www.inhand.com/en/resources-center/#/IndustrialDigitalization/AISingleBoardComputer/MO68A). Hardware connection information does not independently validate every peripheral, overlay or driver. Public-image downloads are on [Software](/software#mo-68a-images); selected accessories are in [Supported accessories](/mo-68a/accessories/supported-accessories/).
