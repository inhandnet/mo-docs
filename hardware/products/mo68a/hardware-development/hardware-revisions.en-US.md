---
title: "Hardware revisions"
description: "Mo 68A hardware revisions and source references."
sidebar_position: 6
---

## Identify the source revision

Each download retains its own version. A common product name does not establish that all files describe the same PCB assembly.

| Resource | Published version / date | Interpretation |
|---|---|---|
| Datasheet | V1.1 / 2026-10-26 | Product specification document revision |
| Schematic | V1.1 / cover 2026-10-21 | Cover and title block identify V1.1 / V11; interior sheets include 2026-10-28 |
| Component placement | V1.1 / 2026-05-06 | PCB layout drawing |
| Mechanical DXF | V1.1 / supplied 2026-10-29 | Engineering drawing with dimensions and side views |
| Mechanical PDF | V1.1 / 2026-10-29 | Original engineering PDF; title block specifies V1.1 and millimetres |
| Assembly STEP | V1.1 / supplied 2026-10-29 | STEP file in the supplied RAR package |
| 40-pin pinout | V1.0 / 2026-10-28 | Derived from User manual V1.0 §14; J11 signal map checked against schematic V1.1 |

The schematic's history records V1.0 as the initial release (25 December 2025). Its V1.1 entry (13 April 2026) lists removal of U17/U21 and surrounding passives, a recessed DisplayPort connector, moving the RTC to SOC I²C1, replacing the MIPI mux with resistor jumpers, and a MicroSD connector change to Molex SD-104031081. These are statements from the source history, not a new electrical or mechanical validation.

## Match a physical board

Record the purchased SKU, PCB/assembly silkscreen and supplied image version. `Mo68A-4G-DC` and `Mo68A-8G-DC` encode memory and MIPI configuration; `DC` means DSI on MIPI0 and CSI on MIPI1. A firmware version such as V1.0.0 or the test installation's 1.0.2 does not identify the PCB revision.

The current mechanical DXF, PDF and STEP package are supplied for V1.1. Confirm the physical board revision and required manufacturing tolerances before enclosure tooling. See [Mechanical](../mechanical/) and [all hardware files](/docs/mo-68a/resource-download/).
