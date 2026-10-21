Mo62A assembly STEP reference
============================

Assembly identifier: MO_62A_MB_PCBA_V1_ASM
STEP filename: MO_62A_MB_PCBA_V1_ASM.stp
ZIP filename: MO_62A_MB_PCBA_V1_ASM.stp.zip
Source: Mo62A PCBA assembly export supplied for the InHand documentation.
Format: ISO 10303-21; AUTOMOTIVE_DESIGN (AP214).
Exporter: Creo Parametric, as recorded in the STEP header.
Header export timestamp: 2026-04-29T10:24:16 (no timezone stated).
Documentation publication: 2026-10-21.

Preparation and checks
----------------------
Personal author metadata was removed from the STEP header. The geometry
DATA section is byte-for-byte identical to the supplied export. This does
not change third-party component rights or constitute a new CAD licence.

STEP: 161380954 bytes
ZIP:   24542271 bytes
SHA256SUMS.txt contains SHA-256 hashes of both files. The ZIP contains exactly
one file, MO_62A_MB_PCBA_V1_ASM.stp, without additional directory paths.

Download the ZIP and SHA256SUMS.txt into a new directory. On Linux:
  unzip MO_62A_MB_PCBA_V1_ASM.stp.zip
  sha256sum -c SHA256SUMS.txt
Both entries must report OK. On Windows, compare Get-FileHash -Algorithm
SHA256 results with the checksum file.

Open the STEP in a compatible CAD application with millimetre units.
OpenCascade successfully imported the model. The documentation's top and
isometric projections were rendered from that geometry, not reconstructed
from a product photo. The axis-aligned assembly envelope in the file's
coordinate system is approximately 89.28 x 58.00 x 21.66 mm (X x Y x Z).
This includes modelled protrusions and is not the 85 x 56 mm PCB outline.

OpenCascade's whole-model topology validity check returned false, despite
successful import and rendering. No automatic geometry repair was applied.
This check does not identify a particular defective component or guarantee
the behaviour of another CAD system. Validate before editing or Boolean
operations and request a validated model for production work. Successful
display and matching checksums do not establish geometric validity.

Use and validation limits
-------------------------
This is a nominal assembly reference, not a toleranced production drawing,
a guaranteed fit, a complete keep-out specification or production approval.
The export timestamp is not a hardware release date. The V1 identifier
alone does not establish correspondence to any particular schematic file
or shipped board revision. Confirm the matching assembly with InHand.

Allow for actual connectors, mating plugs, cable bends, fasteners, thermal
accessories and manufacturing tolerances. Verify against the intended
physical board. No enclosure-fit or mounting-load test is claimed.
