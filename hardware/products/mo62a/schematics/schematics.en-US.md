---
title: "Schematics"
description: "Read the Mo62A circuits by module: power, processor, memory, camera, connectivity, expansion and debug, with verified schematic downloads."
sidebar_position: 5
---


Use this page to understand how the hardware modules connect and where to find their circuits. The descriptions refer to the V1.1-named schematic below, not a complete as-built BOM or a list of tested functions. For physical wiring, use [Hardware interfaces](/mo-62a/hardware-development/hardware-interfaces/); for measured behaviour, follow the linked application guides.

## Download the published files

These PDFs are preserved from the [Mo62A repository schematic directory](https://github.com/inhandnet/Mo62A/tree/master/doc/Schematic) and shipped with this hardware site. The labels below identify the filenames; they are not a verified hardware change history.

| File identifier | Direct PDF | Size |
|---|---|---|
| V11 / 260426 | [MO_62A_S_MB_V11-260426.pdf](/downloads/hardware/mo62a/schematics/MO_62A_S_MB_V11-260426.pdf) | 1,130,181 bytes |
| V1.0 / 260203 | [MO_62A_sch_V1.0-260203.pdf](/downloads/hardware/mo62a/schematics/MO_62A_sch_V1.0-260203.pdf) | 1,058,114 bytes |

The downloaded PDF bytes must match these SHA-256 hashes, also verified against the original public Git LFS object identifiers:

```text
11aea5b41fe549bc77c8b476fdc14d8d407facbcf6f87f41ca69d9b9bf982ce7  MO_62A_S_MB_V11-260426.pdf
50defd55bd0c9edeef46dc421bc65c7743482e32a996ee8e3ac560908cc3aeff  MO_62A_sch_V1.0-260203.pdf
```

These hashes identify the reviewed bytes. Downloads here are complete PDFs, not Git LFS pointers. For a controlled design copy, retain the hardware-site Release version and hash; review any replacement before using it.

## Preview and connector references

The following English reference is redrawn from sheet 1 of the V1.1-named PDF. It translates the Chinese labels and retains the source connections; it is not an unmodified schematic or an as-built component list:

[![English reference diagram redrawn from the V1.1-named Mo62A schematic sheet 1; use the original PDF for circuit design](/img/hardware-development/mo62a-block-v11-en.svg)](/img/hardware-development/mo62a-block-v11-en.svg)

The source diagram's `RJ45+PoE` label refers to the PoE header J5 on sheet 18, which connects the RJ45 transformer taps to an external PoE PD/converter; the board itself has no PoE power circuit. The older V1.0-named PDF also shows an optional eMMC block, which is not evidence that the tested board has eMMC fitted.

Source sheets can disagree: for example, the block diagram names EEPROM `M24M02E`, while sheet 17 of the V1.1-named file labels it `BL24C02F`. This page preserves that discrepancy rather than choosing an unverified fitted part; obtain the revision-matched BOM for component selection.

For the older file, [open the V1.0-named English block reference](/img/hardware-development/mo62a-block-v10-en.svg). It retains the source's dashed optional eMMC block and unresolved `TIMER?` label; do not treat them as fitted or tested capabilities.

### Connector circuits (sheet 17)

Sheet 17 provides the expansion, fan, debug and RTC circuits:

[![Unmodified sheet 17 of the V1.1-named PDF, with J6 expansion, J1 fan, J4 debug and J2 battery references](/img/hardware-development/mo62a-connectors-v11.png)](/img/hardware-development/mo62a-connectors-v11.png)

Use the original PDF for detailed inspection; the previews are not editable design sources. See [Hardware interfaces](/mo-62a/hardware-development/hardware-interfaces/) for the pin mapping and the older README's conflicting connector references.

## Find a module in the schematic

The sheet numbers below are the numbers printed in the schematic title blocks. In the reviewed V11 PDF, viewer pages 7 and 8 contain sheets 8 and 7 respectively. Use the sheet title as well as the PDF page counter when locating a circuit.

| Module | Schematic sheets | What to follow |
|---|---|---|
| Power input and sequencing | 2, 4–7 | USB-C input, switched rails, PMIC outputs and SoC supplies |
| Processor, clocks, reset and boot | 9–14 | Multiplexed SoC pads, reset chain, boot straps and clock connections |
| LPDDR4 and microSD | 8, 14–15 | DDR data/power, MMC1 data bus, card detect and card power switching |
| I²C control and EEPROM | 3, 13, 17 | Control buses, addresses, pull-ups and write protection |
| Wi-Fi and Bluetooth | 14, 16 | SDIO, UART, module enables and antenna |
| Ethernet and PoE taps | 9, 18 | RGMII, PHY control, RJ45 magnetics and J5 |
| USB | 4, 19 | USB0 to Type-C, USB1 to hub, four downstream ports and VBUS switching |
| CSI camera | 20 | Four data-lane pairs, clock pair, I²C and camera control |
| Display and analogue audio | 9–10, 21–22 | Parallel display bus, HDMI bridge, McASP paths and audio codec |
| Expansion, cooling, RTC and debug | 17 | J6, fan PWM/tach, battery backup and console buffer |

## Power input and sequencing

The USB-C 5 V input feeds the board's power-distribution circuits. Sheet 2 gives the high-level rail map; sheets 4–7 contain the input, regulator/load-switch, TPS6593 PMIC and SoC power circuits. The design separates the system 3.3 V rail from switched expansion supplies, while the PMIC supplies the core, DDR and I/O domains.

For an integration change, trace a load back through its switch/regulator to the input instead of treating every connector as an independent supply. The current annotations in the power block diagram are design references, not measured board consumption or a replacement for the published 5 V / 5 A input rating. External-load limits also depend on the fitted protection, supply and cable; this guide does not qualify a new power path.

S1 connects to the PMIC power-button/enable input. The PMIC and SoC reset nets are distinct from the software interpretation of a button press. Consult [Power & thermal](/mo-62a/hardware-development/power-and-thermal/) for ratings and read-only sensors, and [controls](/mo-62a/hardware-development/hardware-interfaces/#controls-and-board-identification) for the unverified button/indicator behaviour.

## Processor, clocks, reset and boot

The AM62A processor contains the Linux application cores, MCU and Device Manager R5F cores, and C7x/MMA acceleration. These are internal SoC blocks, not separate board connectors. Sheets 9–14 show the external pad groups and their routing. A pad's schematic name may describe one alternate function; the active device tree determines which function Linux uses.

Sheet 11 records the resistor-selected boot configuration. Sheets 12–13 include clock/reset-related connections, and sheet 14 collects the MMC interfaces. Follow cross-sheet net labels such as `RESETSTATz` and the peripheral-specific reset nets to distinguish a shared reset source from a device reset controlled by GPIO. Do not bridge test points or change strap resistors to select a software feature.

The documented board boots from microSD. A silicon boot-mode list or an unconnected MMC0 pad group does not prove that another boot device is fitted or qualified. Use [Storage & boot](/docs/mo-62a/system-configuration/storage-and-boot/) for the supported image workflow and [Real-time cores](/docs/mo-62a/real-time-cores/overview/) for processor ownership.

## LPDDR4 and microSD

Sheet 8 contains the 32-bit LPDDR4 interface, address/control signals and decoupling. The exact memory device and boot-loader DDR configuration must match the purchased assembly. The 2 GB, 4 GB and 8 GB product options do not establish which part is fitted to an individual board, and no default capacity is implied here.

Sheets 14–15 route MMC1 to the microSD connector, including card detect, signal protection and controlled card/I/O power. MMC2 is used by the wireless module; it is not another removable-storage slot. The older schematic's optional eMMC block must not be treated as proof of an installed eMMC device.

Keep memory capacity, boot-loader training data and hardware revision as separate identifiers. `free -h` reports memory available to Linux after reservations, not the DRAM part number or PCB revision. See [Hardware revisions](/mo-62a/hardware-development/hardware-revisions/) before choosing revision-dependent files.

## I²C control and EEPROM

The V11 I²C tree on sheet 3 and the detailed circuits identify the following routes. These are SoC bus names, not guaranteed Linux `/dev/i2c-N` numbers or evidence that every device has been probed:

| SoC bus | Connection in the V11 drawings | Integration note |
|---|---|---|
| `SoC_I2C0` | TPS6593 PMIC; PCF85263 RTC; BL24C02 EEPROM | PMIC configuration and EEPROM writes are not general-purpose discovery operations |
| `SoC_I2C1` | TLV320AIC3106 audio codec; SiI9022A HDMI bridge | Shared control bus for on-board devices |
| `SoC_I2C2` | CSI camera; J6 pins 27/28 | Reserved camera bus in the documented pin configuration |
| `WKUP_I2C0` | J6 pins 3/5 | Requires the appropriate peripheral overlay; use 3.3 V-compatible hardware |

Sheet 17 labels the EEPROM `BL24C02F` at 7-bit address `0x50`, with a write-protect connection. Sheet 1 instead names `M24M02E`, and the older SDK README places the EEPROM on `SoC_I2C1`, unlike the V11 sheets 3/17. Do not use those older descriptions as an automatic bus-selection or fitted-part rule. Obtain the revision-matched schematic/BOM and check the active device tree before adding a driver; this guide does not establish an EEPROM data format or a PCB-revision value stored there.

## Wi-Fi and Bluetooth

Sheet 16 shows the `FG6221ASRC-0L` wireless module. Its Wi-Fi data path is the MMC2/SDIO connection from sheet 14; Bluetooth uses UART6 with flow-control signals. Separate enable/interrupt nets and the module supplies are part of the design, so an antenna connection alone is not sufficient software bring-up.

CON1 provides the shared Wi-Fi/BLE antenna connection. Antenna type, placement and RF clearance matter when adding an enclosure. See [Network](/docs/mo-62a/mo-os/network/#shared-wi-fi-and-ble-antenna) for the documented setup; a module part number is not evidence of final-product radio approval. Certification and regulatory information is published under [Compliance](/mo-62a/compliance/) when it becomes available.

## Ethernet and PoE taps

The SoC's RGMII1 interface on sheet 9 connects to the DP83867 PHY on sheet 18. The same sheet includes the management/control, reset and clock connections, the RJ45 magnetics and the Ethernet transformer taps brought to J5.

J5 is not connected as a regulated 5 V output or as GPIO. Power over Ethernet requires an external matching powered-device circuit and DC/DC conversion, with its approved output connected to the board's power rails. The `RJ45+PoE` block label does not identify a supported IEEE class, HAT model or delivered power. See the [J5 integration precautions](/mo-62a/hardware-development/hardware-interfaces/#other-connectors) before selecting an add-on.

## USB hub and Type-C connection

Sheet 19 routes SoC USB1 to the USB2514 hub, which supplies the four USB 2.0 Type-A data ports. They share one upstream USB 2.0 link; they are not four independent host-controller links. The downstream VBUS switch and overcurrent connections are also shown there, so device power and data bandwidth must be budgeted separately.

USB0 is routed to the Type-C connector through sheets 19 and 4. That circuit connection alone does not establish a tested device/gadget or recovery workflow, nor USB Power Delivery voltage negotiation. The documented input is 5 V; do not infer a supported higher input voltage from the Type-C connector shape.

## CSI camera path

Sheet 20 routes CSI0 to the 22-pin, 0.5 mm JP1 FPC connector: four differential data-lane pairs, a differential clock pair, the I²C control path and camera-control/power connections. A four-lane receiver does not mean every sensor uses four lanes or that every 22-pin ribbon has the same wiring.

Sensor compatibility also depends on the driver, device tree, supported modes and ISP configuration. The validated guide uses IMX219; see [Camera & video](/docs/mo-62a/application-development/camera-and-video/). Check the FPC pinout and contact orientation before applying power rather than selecting a cable only by pitch and pin count.

## Display and analogue audio

Sheet 22 connects the SoC parallel display output to the SiI9022A RGB-to-HDMI transmitter and then micro HDMI. Its control/reset path and McASP0 audio connection are separate from the pixel-data bus. The schematic describes the path; supported display modes depend on the driver and connected display.

Sheet 21 uses the TLV320AIC3106 codec for the board's analogue audio jack. It has an McASP1 digital-audio connection and `SoC_I2C1` control. This is distinct from HDMI audio on McASP0 and an optional header audio HAT on McASP2. Use [Display & audio](/docs/mo-62a/mo-os/display-and-audio/) to select the correct Linux output instead of assuming all three paths are one sound device.

## Expansion, cooling, RTC and debug

The [sheet 17 preview](#connector-circuits-sheet-17) collects several otherwise independent circuits:

| Circuit | Signal path | What it means for integration |
|---|---|---|
| J6 expansion | Multiplexed SoC GPIO/peripheral pads plus power and ground | Use physical pin numbers; confirm the overlay and conflicts in [Hardware interfaces](/mo-62a/hardware-development/hardware-interfaces/#40-pin-header-j6) |
| J1 fan | EHRPWM1 control through the fan interface; tachometer return to a timer input | Not the EHRPWM0 output tested on J6 pin 33; J6 pin 36 shares the EHRPWM1 controller |
| RTC and J2 battery | PCF85263 RTC, crystal and backup supply | Battery polarity/type and retention need their own verification; Linux may report the compatible `pcf85363` driver name |
| J4 debug | Buffered SoC UART0 to 3.3 V console RX/TX and ground | Not RS-232 and not a claim of galvanic isolation; the documented console is `ttyS2`, separate from header UART5 |

The older README disagrees on some connector names and fan signal assignments. Follow the reviewed sheet 17 references, the pin table and live device-tree mapping together, and validate any change on the exact board revision. Do not infer a completed electrical test merely because a net is drawn.

## Repository and download checks

This repository stores complete PDF files under `products/mo62a/schematics/files/`; it does not use Git LFS for these attachments. The upstream Mo62A BSP repository uses Git LFS at a different path. Commands for that repository must not be run as if they were mo-hardware paths.

After cloning mo-hardware, inspect the local files:

```bash
file products/mo62a/schematics/files/*.pdf
sha256sum products/mo62a/schematics/files/*.pdf
```

Compare each result with the filename, size and SHA-256 in [Download the published files](#download-the-published-files). A short text file beginning with `version https://git-lfs.github.com/spec/v1` is a pointer, not a PDF; obtain the complete bytes from the published downloads before use. The repository checks reject LFS pointers.

## Revision caveat

The first-sheet title block in the V1.1-named file still says `Rev V1.0`, and its date is April 27, 2026, while the filename ends in `260426`. The V1.0-named file's first-sheet date is April 1, 2026, not the `260203` filename suffix. Do not silently treat filename suffixes as release dates or title-block labels as an authoritative change list. See [Hardware revisions](/mo-62a/hardware-development/hardware-revisions/) for what can and cannot be identified.
