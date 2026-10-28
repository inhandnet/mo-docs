---
title: "Mechanical"
description: "Mo 68A mechanical and source references."
sidebar_position: 4
---

## Downloads

| Resource | File |
|---|---|
| 2D reference drawing | [A3 PDF, derived from V1.1 DXF](/downloads/hardware/mo68a/Mo68A_mechanical_drawing_V1.1-20261028.pdf) |
| PCB layout | [V1.1 top/bottom DXF (ZIP)](/downloads/hardware/mo68a/Mo68A_2d_dxf_V1.1-20260506.zip) |
| Assembly model | [V1.0 STEP (ZIP)](/downloads/hardware/mo68a/Mo68A_3d_model_V1.0-20260429.stp.zip) |
| Component placement | [V1.1 PDF](/downloads/hardware/mo68a/Mo68A_component_placement_V1.1-20260506.pdf) |
| Product dimensions | [Datasheet V1.1, page 3](/downloads/hardware/mo68a/Mo68A_datasheet_V1.1-20261026.pdf#page=3) |

Verify the downloads against [SHA256SUMS.txt](/downloads/hardware/mo68a/SHA256SUMS.txt). Extract the STEP archive to obtain `MO_68A_PCB_MB_V1_ASM.stp`.

## Dimensions and mounting reference

| Item | Value | Source / boundary |
|---|---|---|
| Nominal PCB size | 85 × 56 mm | Datasheet V1.1; excludes connector overhang |
| Mass | 53 g | Datasheet V1.1; board specification |
| Four mounting-hole centres | Approximately 58.00 × 49.00 mm | Extracted from supplied V1.1 DXF coordinates |
| Mounting-hole diameter | Approximately 2.70 mm | V1.1 DXF geometry; not a screw-size or tolerance specification |
| Hole-centre offsets | Approximately 3.50 mm from left, top and bottom nominal edges | DXF reference coordinates |

The derived PDF contains vector top and bottom layout views on A3 at 2:1, with the nominal board and mounting-hole dimensions. Bottom layers retain their original export orientation; they are not mirrored. The DXF does not declare units, but its coordinates match the datasheet's millimetre dimensions. Original recess and auxiliary lines below the nominal lower edge are retained, including lines extending about 1.34 mm below y = 0.

The source datasheet marks its dimensions approximate and for reference only, not for production or processing. The DXF provides no tolerances. Confirm the actual revision and mounting hardware before enclosure tooling; do not substitute Mo 62A dimensions.

## STEP model and height

The supplied V1.0 STEP was imported successfully. In its own coordinates, the assembly bounding box is approximately **89.45 × 57.79 × 21.66 mm**, including connector and other protrusions. Its PCB substrate body is approximately **85.00 × 56.00 × 1.52 mm**. These are model extents, not measurements of a physical board or guaranteed clearance limits.

The STEP is V1.0, whereas the supplied DXF and schematic are V1.1. The V1.1 schematic history includes a recessed DP connector change. Therefore the STEP's height is not applied to the V1.1 2D PDF. The DXF is planar and cannot supply a verified side view or component height. See [Hardware revisions](../hardware-revisions/) for file identification.

Allow space for connector bodies, plugs and cable bend radius, the active cooler, FPC insertion, microSD access and any expansion board. No enclosure-fit, mounting-load or toleranced mechanical validation was performed for this page.
