---
title: "Mechanical"
description: "Mo 68A V1.1 engineering drawings and assembly model."
sidebar_position: 4
---

## Downloads

| Resource | File |
|---|---|
| 2D mechanical drawing | [V1.1 PDF](/downloads/hardware/mo68a/Mo68A_mechanical_drawing_V1.1-20261029.pdf) |
| Editable 2D drawing | [V1.1 DXF](/downloads/hardware/mo68a/Mo68A_2d_dxf_V1.1-20261029.dxf) |
| Assembly model | [V1.1 STEP (RAR)](/downloads/hardware/mo68a/Mo68A_3d_model_V1.1-20261029.stp.rar) |
| Component placement | [V1.1 PDF](/downloads/hardware/mo68a/Mo68A_component_placement_V1.1-20260506.pdf) |
| Product dimensions | [Datasheet V1.1, page 3](/downloads/hardware/mo68a/Mo68A_datasheet_V1.1-20261026.pdf#page=3) |

The mechanical PDF, DXF and STEP archive were supplied by hardware engineering on 29 October 2026 and are published without modifying their contents. Verify the files against [SHA256SUMS.txt](/downloads/hardware/mo68a/SHA256SUMS.txt). Extract the RAR archive with a compatible tool to obtain `MO_68a_pcb_mb_v1_1.stp`.

## Dimensions and mounting

The V1.1 engineering drawing includes a dimensioned board view and two side views. Its title block specifies millimetres. Read connector positions and offsets directly from the supplied drawing.

| Item | Value | Source |
|---|---|---|
| Nominal PCB size | 85 × 56 mm | V1.1 engineering drawing; excludes connector overhang |
| Mounting-hole callout | Ø2.5 mm | V1.1 engineering drawing; use the drawing for hole positions |
| Mass | 53 g | Datasheet V1.1; board specification |

Use the printed dimension values rather than measuring the PDF's display or print scale. Confirm the physical board revision, mating hardware and manufacturing tolerances before enclosure tooling.

## Assembly model and integration

The current archive contains the V1.1 STEP assembly model. The archive passed an integrity check and the STEP file loaded successfully in a CAD reader. This checks the delivered file, not physical clearances or enclosure fit.

Allow space for connector bodies, plugs and cable bend radius, the active cooler, FPC insertion, microSD access and any expansion board. See [Hardware revisions](../hardware-revisions/) for the versions of the other supplied documents.
