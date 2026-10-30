---
title: "Mechanical"
description: "Download the Mo62A assembly STEP model, verify its checksum and use the mechanical references for enclosure planning."
sidebar_position: 4
---


Use the 2D drawings for dimensions and the STEP assembly for component and connector clearance. Match each file to your PCB and assembly revision before designing an enclosure.

## Downloads {#download-the-assembly-step-model}

| Document | Version | Download |
|---|---|---|
| Mechanical drawing (2D) | V1.0 | [PDF](/downloads/hardware/mo62a/Mo62A_mechanical_drawing_V1.0-20260409.pdf) |
| Mechanical drawing (DXF) | V1.1 | [DXF (ZIP)](/downloads/hardware/mo62a/Mo62A_2d_dxf_V1.1-20260504.zip) |
| 3D model (STEP) | V1.1 | [STEP (ZIP)](/downloads/hardware/mo62a/Mo62A_3d_model_V1.1-20261030.stp.zip) |
| Component placement | V1.1 | [PDF](/downloads/hardware/mo62a/Mo62A_component_placement_V1.1-20260504.pdf) |
| Datasheet | V1.5 | [PDF](/downloads/hardware/mo62a/Mo62A_datasheet_V1.5-20261026.pdf) |

Verify downloads against [SHA-256 checksums](/downloads/hardware/mo62a/SHA256SUMS.txt).

The DXF ZIP contains top and bottom PCB layouts in millimetres (DXF R12): outline, pads, silkscreen, reference designators and drill holes. The STEP ZIP is 24.1 MiB and extracts to the 158.1 MiB `Mo_62A_P_MB_V11.stp`.

## Dimensions and mounting {#published-dimensions}

The English [Mo62A Datasheet V1.5](/downloads/hardware/mo62a/Mo62A_datasheet_V1.5-20261026.pdf), gives the nominal dimensions on page 3 and mass on page 5. The values below are source references, not measurements taken from the STEP model or a physical sample.

:::warning[Reference only, not a production drawing]
The source explicitly states that all dimensions are approximate, for reference only, and must not be used for manufacturing. Dimensions can change without notice. This page does not replace a revision-controlled mechanical drawing with tolerances.
:::

| Item | Value | Source / use |
|---|---|---|
| Board outline | 85 × 56 mm | Initial space planning only |
| Mass | 47 g | Product specification; accessories are separate |
| Mounting-hole centres | 58 × 49 mm in the supplied 2D mechanical drawing | Confirm against the actual revision and a toleranced drawing |
| Hole diameter | 2.5 mm in the supplied 2D mechanical drawing | Do not infer an approved screw size or tightening torque |
| Connector positions and selected dimensions | Reference front, side and interface views on page 3 | Not a complete height or keep-out specification; confirm against the revision-matched mechanical package |

## Assembly model and previews

The V1.1 assembly model was supplied on October 30, 2026 as `Mo_62A_P_MB_V11.stp`. Its STEP header records a Creo export timestamp of October 30, 2026 and retains the internal identifier `0_MO_62A_MB_PCBA_V1_ASM`. The published version follows the supplied V1.1 model, not that internal name. The STEP file is packaged without modifying its contents.

:::warning[Confirm the assembly revision before designing around it]
The downloadable model is a nominal assembly reference, not a toleranced manufacturing drawing. It does not establish an approved enclosure fit, fastening specification, keep-out volume or production release. Confirm the board revision and fitted components with InHand, and check a physical sample before enclosure tooling. A model's `V1` identifier must not be assumed to mean the same revision as a schematic filename.

The supplied V1.1 file imported successfully in OpenCascade and passed its whole-model topology validity check. The download retains the supplied geometry without automatic repair. Check the import in your own CAD application before editing or Boolean operations; this software check does not validate physical clearances or enclosure fit.
:::

### Verify and open the model {#1-download-and-check-the-files}

Save the ZIP and `SHA256SUMS.txt` in a new directory, then run on a Linux workstation:

```bash
unzip Mo62A_3d_model_V1.1-20261030.stp.zip
sha256sum -c SHA256SUMS.txt --ignore-missing
```

Both the ZIP and the extracted STEP file must report `OK`. On Windows, use `Get-FileHash -Algorithm SHA256` and compare each result with the downloaded checksum file. Keep the checksum with your enclosure project so the exact reference is identifiable.

### CAD previews {#2-import-and-inspect-the-assembly}

Open the extracted `.stp` file in a STEP-capable CAD application and check that the unit is millimetres. The file was successfully imported with OpenCascade for the views below. These are projections of the supplied geometry, not photographs or drawings reconstructed from a product image.

[![Isometric projection rendered directly from the supplied Mo62A assembly STEP model, showing the board, headers and connector bodies](/img/hardware-development/mo62a-step-isometric.png)](/img/hardware-development/mo62a-step-isometric.png)

[![Top projection of the same Mo62A assembly STEP model for nominal component-placement reference, without manufacturing tolerances](/img/hardware-development/mo62a-step-top.png)](/img/hardware-development/mo62a-step-top.png)

In the file's coordinate system, the full assembly has an axis-aligned bounding box of approximately **89.28 × 58.00 × 21.66 mm** (X × Y × Z). This includes the modelled component and connector protrusions: it is not the 85 × 56 mm PCB outline, a recommended enclosure's internal dimensions, or a measured physical-board result. Add space for mating plugs, cable bends, mounting tolerances and the accessories fitted to your product.

## Enclosure and cable clearance

Use the [interface map](/mo-62a/hardware-development/hardware-interfaces/#connector-map) to identify connectors and the STEP views above for nominal component placement. A similar board footprint does not guarantee that a case made for another 85 × 56 mm board fits. Check all of the following on the board revision and accessories you will actually ship:

- micro HDMI, stacked USB and Ethernet plug bodies, cable bends and strain relief.
- USB-C power plug, microSD insertion/removal and access to controls.
- Camera FPC entry, latch access, bend space and correct contact orientation.
- Header/HAT height, underside clearance and safe separation from conductive parts.
- Heatsink, fan, airflow path, antenna and RF-cable clearance.
- Mounting points, insulating spacers and mechanical load from external cables.

See [Hardware interfaces](/mo-62a/hardware-development/hardware-interfaces/) for connector identification and [Power & thermal](/mo-62a/hardware-development/power-and-thermal/) for cooling considerations.

## Integration limits {#production-drawings-and-validation-limits}

The supplied STEP, 2D PDF and DXF downloads are available above. A toleranced production drawing has not been verified. No case-fit or mounting-load test was performed for this page. The model does not remove the source datasheet's reference-only restriction on its dimension drawing.

Before enclosure tooling, request the mechanical package for the exact PCB/assembly revision, including connector envelopes, keep-outs, mounting tolerances and approved fasteners. Include the board's silkscreen and ordered SKU; a schematic filename alone is not sufficient revision identification. See [Hardware revisions](/mo-62a/hardware-development/hardware-revisions/).

## Related resources

- [Hardware interfaces](/mo-62a/hardware-development/hardware-interfaces/): connector and cable identification.
- [Power & thermal](/mo-62a/hardware-development/power-and-thermal/): supply and cooling requirements.
- [Hardware revisions](/mo-62a/hardware-development/hardware-revisions/): PCB, assembly and file identifiers.
- [Resource download](/docs/mo-62a/resource-download/): all hardware files and checksums.
