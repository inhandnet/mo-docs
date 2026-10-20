#!/usr/bin/env python3
"""Mo62A UART5, physical pins 8 (TX) to 10 (RX), 115200 baud 8N1."""
from pathlib import Path
import serial

status = Path("/proc/device-tree/bus@f0000/serial@2850000/status")
if status.read_bytes().rstrip(b"\0") != b"okay":
    raise SystemExit("UART5 is disabled; boot microSD-uart5 first")
payloads = (b"Mo62A UART5 loopback\r\n", bytes(range(256)))
with serial.Serial("/dev/ttyS3", 115200, timeout=2, write_timeout=2,
                   rtscts=False, dsrdtr=False, xonxoff=False, exclusive=True) as port:
    port.reset_input_buffer()
    for payload in payloads:
        count = port.write(payload)
        port.flush()
        received = port.read(len(payload))
        passed = count == len(payload) and received == payload
        print(f"115200 8N1: sent={count} received={len(received)} "
              f"exact_match={passed} {'PASS' if passed else 'FAIL'}")
        if not passed:
            raise SystemExit("UART loopback mismatch")
print("PASS: ASCII and all 256 byte values; port closed")
