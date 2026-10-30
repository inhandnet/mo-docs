---
title: "Mechanical"
description: "Mo 68A V1.1 engineering drawings and assembly model."
sidebar_position: 4
---

Use the 2D drawings for dimensions and the STEP assembly for component and connector clearance. Match each file to your PCB and assembly revision before designing an enclosure.

## Downloads

| Document | Version | Download |
|---|---|---|
| Mechanical drawing (2D) | V1.1 | [PDF](/downloads/hardware/mo68a/Mo68A_mechanical_drawing_V1.1-20261029.pdf) |
| Mechanical drawing (DXF) | V1.1 | [DXF](/downloads/hardware/mo68a/Mo68A_2d_dxf_V1.1-20261029.dxf) |
| 3D model (STEP) | V1.1 | [STEP (RAR)](/downloads/hardware/mo68a/Mo68A_3d_model_V1.1-20261029.stp.rar) |
| Component placement | V1.1 | [PDF](/downloads/hardware/mo68a/Mo68A_component_placement_V1.1-20260506.pdf) |
| Datasheet | V1.1 | [PDF](/downloads/hardware/mo68a/Mo68A_datasheet_V1.1-20261026.pdf) |

Verify downloads against [SHA-256 checksums](/downloads/hardware/mo68a/SHA256SUMS.txt).

The mechanical PDF, DXF and STEP archive were supplied by hardware engineering on 29 October 2026 and are published without modifying their contents. Extract the RAR archive with a compatible tool to obtain `MO_68a_pcb_mb_v1_1.stp`.

## Dimensions and mounting

The V1.1 engineering drawing includes a dimensioned board view and two side views. Its title block specifies millimetres. Read connector positions and offsets directly from the supplied drawing.

| Item | Value | Source / use |
|---|---|---|
| Nominal PCB size | 85 × 56 mm | V1.1 engineering drawing; excludes connector overhang |
| Mounting-hole callout | Ø2.5 mm | V1.1 engineering drawing; use the drawing for hole positions |
| Mass | 53 g | Datasheet V1.1; board specification |

Use the printed dimension values rather than measuring the PDF's display or print scale. Confirm the physical board revision, mating hardware and manufacturing tolerances before enclosure tooling.

## Assembly model and previews {#assembly-model-and-integration}

The current archive contains the V1.1 STEP assembly model. The archive passed an integrity check and the STEP file loaded successfully in a CAD reader. This checks the delivered file, not complete topology, physical clearances or enclosure fit.

### Verify and open the model

Save the STEP RAR and checksum file in the same directory. On a Linux workstation with a compatible RAR extractor:

```bash
sha256sum -c SHA256SUMS.txt --ignore-missing
unrar x Mo68A_3d_model_V1.1-20261029.stp.rar
```

The archive must report `OK`. The published checksum list verifies the delivered archive; it does not list a separate hash for the extracted STEP file. On Windows, use `Get-FileHash -Algorithm SHA256` and compare the archive hash before extraction. Open the `.stp` in a STEP-capable CAD application and confirm millimetres as the unit. Inspect the model there for the required top and isometric views.

## Enclosure and cable clearance

Use the [connector index](/mo-68a/hardware-development/hardware-interfaces/#connector-map) and check the assembled product with its actual accessories:

- mini DisplayPort, stacked USB and Ethernet plugs, cable bends and strain relief.
- USB-C power, microSD insertion/removal and reset-button access.
- MIPI and PCIe FPC insertion, latch access, bend space and contact orientation.
- Expansion-board height, underside clearance and insulation.
- Heatsink, fan and an unobstructed airflow path.
- Mounting points, insulating spacers and loads from external cables.

The shared 85 × 56 mm footprint does not guarantee compatibility with another board's enclosure.

## Integration limits

The supplied STEP, 2D PDF and DXF are available above. Match their V1.1 revision to the physical board and confirm required manufacturing tolerances, connector envelopes, keep-outs and approved fasteners before tooling. Successful file import does not establish case fit or mounting-load performance.

## Related resources

- [Hardware interfaces](/mo-68a/hardware-development/hardware-interfaces/): connector and cable identification.
- [Power & thermal](/mo-68a/hardware-development/power-and-thermal/): supply and cooling requirements.
- [Hardware revisions](/mo-68a/hardware-development/hardware-revisions/): PCB, assembly and file identifiers.
- [Resource download](/docs/mo-68a/resource-download/): all hardware files and checksums.
