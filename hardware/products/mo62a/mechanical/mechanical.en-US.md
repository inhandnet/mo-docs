---
title: "Mechanical"
description: "Download the Mo62A assembly STEP model, verify its checksum and use the mechanical references for enclosure planning."
sidebar_position: 4
---


## Download the assembly STEP model

The Mo62A PCBA assembly model is available as a compressed STEP file for inspecting component placement and planning enclosure clearances:

- [Assembly STEP model (ZIP, 23.4 MiB)](/downloads/hardware/mo62a/MO_62A_MB_PCBA_V1_ASM.stp.zip) — extracts to a 153.9 MiB `.stp` file.
- [SHA-256 checksums](/downloads/hardware/mo62a/SHA256SUMS.txt) — covers both the ZIP and the extracted STEP file.
- [Model provenance and verification notes](/downloads/hardware/mo62a/README.txt).

The assembly identifier is `MO_62A_MB_PCBA_V1_ASM`. Its STEP header records a Creo export timestamp of April 29, 2026; this is an export timestamp, not a hardware release date or proof that the model matches every shipped revision. Personal author metadata has been removed; the geometry data is unchanged.

:::warning[Confirm the assembly revision before designing around it]
The downloadable model is a nominal assembly reference, not a toleranced manufacturing drawing. It does not establish an approved enclosure fit, fastening specification, keep-out volume or production release. Confirm the board revision and fitted components with InHand, and check a physical sample before enclosure tooling. A model's `V1` identifier must not be assumed to mean the same revision as a schematic filename.

OpenCascade imported and rendered this file, but its whole-model topology validity check did not pass. The download retains the supplied geometry without automatic repair. Validate the import in your CAD application before editing or Boolean operations; request a validated model for production work. Successful display and a matching checksum do not establish geometric validity.
:::

### 1. Download and check the files

Save the ZIP and `SHA256SUMS.txt` in a new directory, then run on a Linux workstation:

```bash
unzip MO_62A_MB_PCBA_V1_ASM.stp.zip
sha256sum -c SHA256SUMS.txt
```

Both files must report `OK`. On Windows, use `Get-FileHash -Algorithm SHA256` and compare each result with the downloaded checksum file. Keep the checksum with your enclosure project so the exact reference is identifiable.

### 2. Import and inspect the assembly

Open the extracted `.stp` file in a STEP-capable CAD application and check that the unit is millimetres. The file was successfully imported with OpenCascade for the views below. These are projections of the supplied geometry, not photographs or drawings reconstructed from a product image.

[![Isometric projection rendered directly from the supplied Mo62A assembly STEP model, showing the board, headers and connector bodies](/img/hardware-development/mo62a-step-isometric.png)](/img/hardware-development/mo62a-step-isometric.png)

[![Top projection of the same Mo62A assembly STEP model for nominal component-placement reference, without manufacturing tolerances](/img/hardware-development/mo62a-step-top.png)](/img/hardware-development/mo62a-step-top.png)

In the file's coordinate system, the full assembly has an axis-aligned bounding box of approximately **89.28 × 58.00 × 21.66 mm** (X × Y × Z). This includes the modelled component and connector protrusions: it is not the 85 × 56 mm PCB outline, a recommended enclosure's internal dimensions, or a measured physical-board result. Add space for mating plugs, cable bends, mounting tolerances and the accessories fitted to your product.

## Published dimensions

The English Mo62A Datasheet V1.0, available through the [InHand Resource Center](https://www.inhand.com/en/resources-center/#/IndustrialDigitalization/AISingleBoardComputer/MO62A), gives the nominal dimensions on page 3 and mass on page 5. The values below are source references, not measurements taken from the STEP model or a physical sample.

:::warning[Reference only, not a production drawing]
The source explicitly states that all dimensions are approximate, for reference only, and must not be used for manufacturing. Dimensions can change without notice. This page does not replace a revision-controlled mechanical drawing with tolerances.
:::

| Item | Published reference | Use |
|---|---|---|
| Board outline | 85 × 56 mm | Initial space planning only |
| Mass | 47 g | Product specification; accessories are separate |
| Mounting-hole centres | Approximately 58 × 49 mm in the drawing | Confirm against the actual revision and a toleranced drawing |
| Hole diameter | Approximately 2.5 mm in the drawing | Do not infer an approved screw size or tightening torque |
| Connector positions and selected dimensions | Reference front, side and interface views on page 3 | Not a complete height or keep-out specification; confirm against the revision-matched mechanical package |

## Enclosure and cable clearance

Use the [interface map](/mo-62a/hardware-development/hardware-interfaces/#locate-the-board-features) to identify connectors and the STEP views above for nominal component placement. A similar board footprint does not guarantee that a case made for another 85 × 56 mm board fits. Check all of the following on the board revision and accessories you will actually ship:

- micro HDMI, stacked USB and Ethernet plug bodies, cable bends and strain relief.
- USB-C power plug, microSD insertion/removal and access to controls.
- Camera FPC entry, latch access, bend space and correct contact orientation.
- Header/HAT height, underside clearance and safe separation from conductive parts.
- Heatsink, fan, airflow path, antenna and RF-cable clearance.
- Mounting points, insulating spacers and mechanical load from external cables.

See [Hardware interfaces](/mo-62a/hardware-development/hardware-interfaces/) for connector identification and [Power & thermal](/mo-62a/hardware-development/power-and-thermal/) for cooling considerations.

## Production drawings and validation limits

The assembly STEP model above is available; a separately released DXF outline and a toleranced production drawing have not been verified. No case-fit or mounting-load test was performed for this page. The model does not remove the source datasheet's reference-only restriction on its dimension drawing.

Before enclosure tooling, request the mechanical package for the exact PCB/assembly revision, including connector envelopes, keep-outs, mounting tolerances and approved fasteners. Include the board's silkscreen and ordered SKU; a schematic filename alone is not sufficient revision identification. See [Hardware revisions](/mo-62a/hardware-development/hardware-revisions/).
