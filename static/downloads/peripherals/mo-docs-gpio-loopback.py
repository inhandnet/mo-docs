#!/usr/bin/env python3
"""Mo62A, libgpiod 2.x: GPIO loopback on physical pins 7/11, 8/10, 33/35."""
from contextlib import ExitStack
from pathlib import Path
import time
import gpiod
from gpiod.line import Direction, Value

PAIRS = (
    ((7, 1, 39), (11, 2, 23)),
    ((8, 2, 25), (10, 2, 24)),
    ((33, 2, 13), (35, 1, 91)),
)

def main():
    for node in ("serial@2850000", "pwm@23000000"):
        status = Path("/proc/device-tree/bus@f0000") / node / "status"
        if status.exists() and status.read_bytes().rstrip(b"\0") == b"okay":
            raise SystemExit(f"{node} is enabled; boot microSD-default before GPIO testing")
    inputs = gpiod.LineSettings(direction=Direction.INPUT)
    lines = {}
    for pair in PAIRS:
        for _, chip, offset in pair:
            lines.setdefault(chip, {})[offset] = inputs
    with ExitStack() as stack:
        requests = {chip: stack.enter_context(gpiod.request_lines(
            f"/dev/gpiochip{chip}", consumer="mo-docs-loopback", config=config))
            for chip, config in lines.items()}
        try:
            for first, second in PAIRS:
                for output, input_ in ((first, second), (second, first)):
                    # Release both directions before selecting the new output.
                    for _, chip, offset in (first, second):
                        requests[chip].reconfigure_lines({offset: inputs})
                    out_pin, out_chip, out_line = output
                    in_pin, in_chip, in_line = input_
                    requests[out_chip].reconfigure_lines({out_line: gpiod.LineSettings(
                        direction=Direction.OUTPUT, output_value=Value.INACTIVE)})
                    received = []
                    expected = [0, 1, 0, 1, 1, 0, 1, 0]
                    for value in expected:
                        requests[out_chip].set_value(out_line, Value.ACTIVE if value else Value.INACTIVE)
                        time.sleep(0.01)
                        received.append(int(requests[in_chip].get_value(in_line) == Value.ACTIVE))
                    passed = received == expected
                    print(f"Pin {out_pin:2} -> Pin {in_pin:2}: TX={''.join(map(str, expected))} "
                          f"RX={''.join(map(str, received))} {'PASS' if passed else 'FAIL'}", flush=True)
                    if not passed:
                        raise SystemExit("Loopback mismatch; check the physical pin numbers and jumper")
        finally:
            for chip, config in lines.items():
                requests[chip].reconfigure_lines({offset: inputs for offset in config})
    print("PASS: 3 pairs, both directions; all six lines returned to input")

if __name__ == "__main__":
    main()
