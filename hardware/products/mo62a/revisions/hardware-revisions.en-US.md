---
title: "Hardware revisions"
description: "Identify the physical Mo62A board, record PCB and assembly details, and select revision-matched design files."
sidebar_position: 6
---

## Identify the board, not just the software

Use the markings on your own board and its order/assembly records to identify the hardware. Then confirm which schematic and mechanical package apply. A filename containing `V11`, a Linux model string or the appearance of a connector is not enough to select a hardware revision.

### 1. Read the physical markings

Disconnect all power before handling the board. Use the [connector map](/mo-62a/hardware-development/hardware-interfaces/#locate-the-board-features) to orient the component side: J6 is along the top edge, with USB and Ethernet on the right. The reference board's model/revision silkscreen is below J6.

Copy the full marking, including punctuation and any adjacent date. The standard product image shows `Mo_62A_P_MB_V1.0` and `2026-02-04`; these are examples from that image, not the identity of every shipped board or a verified manufacturing date. Check both sides of your own board for additional assembly or serial labels, without removing components or peeling labels.

### 2. Keep the identifiers separate

| Identifier | Where to obtain it | What it establishes |
|---|---|---|
| PCB model/revision marking | Silkscreen on the actual board | The printed PCB identifier; not a complete fitted-component list |
| Date or other adjacent marking | Copy exactly from the actual board | A traceable marking; its meaning needs confirmation if undocumented |
| Assembly/BOM revision and serial or lot | Assembly label or supplier record, if available | The assembled configuration when matched to the supplier's records |
| Ordered SKU and memory option | Order confirmation or supplied product label | The purchased option; 2 GB, 4 GB and 8 GB are not PCB revision numbers |
| Schematic filename and SHA-256 | Downloaded PDF and [published checksums](/mo-62a/hardware-development/schematics/#download-the-published-files) | The exact design document you reviewed, not proof it matches the assembly |
| Firmware and Linux versions | Image release, `/etc/os-release` and `uname -r` | Software configuration, not physical hardware identity |

`free -h` reports memory available to Linux after reservations. The device-tree model is supplied by software, and an RTC driver name can cover compatible parts. None of these alone identifies the PCB or fitted BOM.

### 3. Match the design files

Compare the identifiers below with the exact PDF you downloaded. If a filename, title block or board marking disagrees, keep the original identifiers and ask InHand for the matching schematic/BOM and any engineering change notice. Do not silently rename a revision or assume that the newer-looking filename applies to your board.

## Published schematic identifiers

Two files are available from [Schematics](/mo-62a/hardware-development/schematics/), with checked sizes and SHA-256 hashes. The first-sheet title-block fields are transcribed here so they can be compared without reading cropped screenshots:

| Filename identifier | First-sheet title block | Interpretation |
|---|---|---|
| `V1.0-260203` | Rev V1.0; April 1, 2026 | Filename suffix and title-block date differ |
| `V11-260426` | Rev V1.0; April 27, 2026 | Filename and first-sheet revision/date identifiers differ; the reason is not established |

These are document identifiers, not an approved board-revision comparison or release chronology. The reason for the filename/title-block differences has not been established. The [module descriptions and circuit references](/mo-62a/hardware-development/schematics/#find-a-module-in-the-schematic) explain the drawings without treating their labels as an as-built BOM.

## Can software read the hardware revision?

The V11-named schematic includes `HW_REV0`, `HW_REV1` and `HW_REV2` strap nets on sheet 9. The reviewed public material does not establish a validated mapping from their values to the complete PCB/assembly revision. Their presence is not enough to publish a reliable revision-decoding command.

Likewise, the EEPROM circuit does not establish an identification-record format or guarantee that a revision has been programmed. Do not probe undocumented straps, change pin multiplexing or write the EEPROM to identify the board. Use the physical and supplier records above unless a revision-matched identification procedure is provided.

## Record a board for integration or support

Attach a clear photograph of your own PCB marking and relevant assembly label when requesting revision-dependent advice. Use this template; leave unavailable fields as `not recorded` instead of guessing. Share serial/lot identifiers through the appropriate support channel rather than putting them in public issue screenshots.

```text
PCB silkscreen (exact):
Adjacent date/marking (exact):
Assembly/BOM revision:
Serial or lot (if available):
Ordered SKU and memory option:
Schematic filename:
Schematic SHA-256:
Mechanical package filename/revision (if relevant):
Mo OS image version:
Kernel version:
Interface or accessory being integrated:
```

## What is not established

No authoritative engineering change notice, assembly/BOM change list or revision-to-serial mapping was found in the reviewed public material. Consequently, this page does not claim that every difference between the two PDFs is fitted on every board, or that accessories and images are interchangeable across all revisions.

The V1.1-named PDF has local change annotations on some sheets, but those annotations are not a complete release history. Connector references also conflict with the older SDK README: both PDFs identify the expansion header as J6 and the fan as J1. Use [Hardware interfaces](/mo-62a/hardware-development/hardware-interfaces/) and verify the actual connector and pin 1.

## Before a revision-dependent change

1. Record the physical board and assembly identification.
2. Keep the exact schematic file and its hash, not just a moving branch URL.
3. Ask InHand to confirm the matching schematic/BOM, engineering changes and any required software or accessory restrictions.
4. Revalidate the affected interface, power or mechanical fit on the target revision.

For enclosure manufacture, also obtain the toleranced mechanical package. The public [dimensions and STEP reference](/mo-62a/hardware-development/mechanical/) explicitly exclude production use; a successful CAD import does not establish that the model matches every assembly.
