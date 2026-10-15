---
allowedProducts:
  - mo-62a
---

## Verify the download

Compare the downloaded file's SHA256 digest with the checksum published for that exact release asset. Verify the file in the form distributed by the publisher, before extracting or flashing it unless the release instructions specify otherwise.

On Linux:

```bash
sha256sum /path/to/downloaded-file
```

On macOS:

```bash
shasum -a 256 /path/to/downloaded-file
```

On Windows PowerShell:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath 'C:\path\to\downloaded-file'
```

Replace the example path with your actual downloaded file. If the digest differs, do not flash the image. A matching checksum detects a mismatch; it is not a substitute for obtaining the checksum and file from a trusted release channel.
