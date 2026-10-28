---
title: "Schematics"
description: "Mo 68A schematics and source references."
sidebar_position: 5
---

Download the [Mo 68A schematic V1.1 (PDF)](/downloads/hardware/mo68a/Mo68A_schematic_V1.1-20261021.pdf) and [component-placement drawing V1.1 (PDF)](/downloads/hardware/mo68a/Mo68A_component_placement_V1.1-20260506.pdf). Verify files against [SHA256SUMS.txt](/downloads/hardware/mo68a/SHA256SUMS.txt).

The schematic contains 22 sheets. Its cover is dated 21 October 2026; several interior title blocks are dated 28 October. The download filename follows the cover date and does not imply all sheets have the same date. See [Hardware revisions](../hardware-revisions/) before matching it to a board.

## Sheet index

| PDF sheet | Title / circuit |
|---|---|
| 1–2 | Title and revision history |
| 3 | Power block and I²C tree |
| 4 | System block |
| 5 | SoC EMIF0 and LPDDR4 |
| 6 | MicroSD and RGMII |
| 7 | USB, PCIe and DisplayPort |
| 8 | CSI / DSI connectors and resistor routing |
| 9 | MCU / main IO, oscillator and boot |
| 10 | GPIO |
| 11–14 | Analog, IO, digital power, grounds and unused pins |
| 15 | USB 3.0 hub |
| 16 | USB connectors |
| 17 | Ethernet |
| 18 | 40-pin expansion, fan, RTC, EEPROM, LEDs and debug UART |
| 19 | PMIC |
| 20 | HCPS power-control circuit |
| 21–22 | Miscellaneous power and 5 V input |

## Connector review

Use [Hardware interfaces](../hardware-interfaces/) for a connector index, expansion pinout and the V1.1 MIPI configuration. The schematic records design connections, not validation of a particular cable, peripheral or software image.

**Source discrepancies:** sheet 18 has conflicting pin numbering between the drawn J6 debug circuit and its silkscreen note, and between the J8 battery circuit and the older hardware-reference table. Do not wire either connector from a text note alone; confirm the actual PCB pin numbering, ground and polarity. The interface page records the specific differences.

The schematic and placement PDF are the supplied source files. Mechanical downloads are on [Mechanical](../mechanical/); the full file list is in [Resource download](/docs/mo-68a/resource-download/).
