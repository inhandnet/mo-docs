---
title: "Hardware interfaces"
description: "Mo62A physical pins, Linux GPIO mapping, connector references and verified peripheral modes."
sidebar_position: 2
---


Start with the connector map, check the electrical requirements, then use the [40-pin table](#40-pin-header-j6) to find the signal and Linux GPIO line. For runnable GPIO, UART and PWM examples, continue with [GPIO & peripherals](/docs/mo-62a/application-development/gpio-and-peripherals/).

:::warning[Disconnect power before wiring]
Header signals use 3.3 V logic. Do not apply 5 V to a GPIO, connect two outputs together, or assume that a mechanically compatible HAT has compatible signals and software. Locate physical pin 1 on your board before connecting anything.
:::

## Locate the board features

The component-side reference below uses the standard Mo62A product image, with the 40-pin header along the top edge and USB/Ethernet on the right. Numbers run clockwise from J6 at the top. They are location markers, not electrical pin numbers. The image retains its original perspective; it is not an orthographic drawing or a dimensional reference.

[![Mo62A standard component-side image with large aligned location markers 01 to 14 running clockwise from the 40-pin header; electrical pin numbering is shown separately in the J6 section](/img/hardware-development/mo62a-connectors-numbered.svg)](/img/hardware-development/mo62a-connectors-numbered.svg)

| Marker | Connector or control | Purpose and next check |
|---|---|---|
| 01 | J6 — 40-pin expansion | 3.3 V signals plus separate power/ground pins; see [J6 orientation and pin assignments](#40-pin-header-j6) |
| 02 | J1 — fan | 4-pin fan connector; match the pinout and cable below |
| 03 | USB Type-A | Four USB 2.0 ports in two stacked pairs; shared upstream link and power budget |
| 04 | Ethernet | Gigabit RJ45; PoE conversion is not built into the board |
| 05 | J5 — transformer taps | Requires a matching external PoE PD/converter; not a regulated 5 V output |
| 06 | JP1 — CSI camera | 22-pin, 0.5 mm FPC; verify cable pinout and contact orientation |
| 07 | 3.5 mm audio | On-board analogue audio connection |
| 08 | J4 — debug UART | 3.3 V TTL console, not RS-232; 115200 8N1 |
| 09 | micro HDMI | Display output; use a matching cable |
| 10 | J2 — RTC battery | 2-pin backup-battery connector; verify battery type and polarity |
| 11 | USB-C — power input | 5 V supply; see [Power & thermal](/mo-62a/hardware-development/power-and-thermal/) |
| 12 | Status indicator | Linux exposes red/green LED devices; see [Controls and board identification](#controls-and-board-identification) |
| 13 | S1 — power button | PMIC power-button input; behaviour depends on the configured software |
| 14 | CON1 — antenna | Shared Wi-Fi/BLE antenna connection |

Open the image to enlarge it. Check the connector shape, silkscreen and pin-1 mark on your own board before connecting anything. J5 is a transformer-tap header, not a 5 V supply; see [Other connectors](#other-connectors).

## Camera, fan and debug UART

The CSI camera connector JP1 is a 22-pin, 0.5 mm FPC connector. MIPI CSI-2 support alone does not establish FPC pinout or cable compatibility; verify the wiring and contact orientation. The tested sensor is IMX219. Disconnect power before handling the ribbon and use the [camera connection guide and JPEG capture test](/docs/mo-62a/application-development/camera-and-video/).

The small fan, debug and battery connectors are separate interfaces, not interchangeable power sockets:

| Connector | Schematic pin assignment | Before connecting |
|---|---|---|
| J1 fan, SH1.0-4p | 1: 5 V; 2: PWM; 3: GND; 4: tachometer | Use a matching fan and cable; do not rely on wire colours |
| J4 debug, SH1.0-3p | 1: board RX; 2: GND; 3: board TX | 3.3 V TTL USB-UART; 115200 baud, 8N1 |
| J2 RTC battery, SH1.0-2p | 1: GND; 2: VBAT | Verify approved battery type and plug polarity |

The debug UART is `ttyS2`, not the header's UART5 `/dev/ttyS3`. Cross adapter TX to board RX and adapter RX to board TX, and connect ground. Do not connect an RS-232 voltage interface or use the adapter's power wire to power the board. See [First boot](/docs/mo-62a/getting-started/first-boot/#serial-console).

J2 is a battery connector, not a CR1220 coin-cell holder. The schematic labels the external RTC as PCF85263ATL; Linux reports the compatible driver name `pcf85363`. Driver naming alone does not establish a board revision. Battery retention was not tested in this review.

## Other connectors

| Interface | Board connection | Integration note |
|---|---|---|
| Power | USB Type-C, 5 V | See [Power & thermal](/mo-62a/hardware-development/power-and-thermal/) |
| Ethernet | Gigabit RJ45, DP83867 PHY | Transformer centre taps are brought out on J5 for an external PoE PD/converter |
| PoE header J5 | 2 × 2, 2.54 mm, next to the RJ45 | Transformer taps: 1 `TR1_TAP`, 2 `TR0_TAP`, 3 `TR3_TAP`, 4 `TR2_TAP` (schematic sheet 18). These are not GPIO or a regulated 5 V output |
| USB | Four USB 2.0 Type-A ports through a hub | Share the upstream link and power budget |
| Display | micro HDMI through SiI9022A | Use the tested [display setup](/docs/mo-62a/mo-os/display-and-audio/) |
| Audio | 3.5 mm jack with TLV320AIC3106 | Distinct from an optional header audio HAT |
| Antenna | CON1, U.FL-style RF connector | Shared Wi-Fi/BLE antenna; follow the [connection guide](/docs/mo-62a/mo-os/network/#shared-wi-fi-and-ble-antenna) |

:::warning[J5 is not a 5 V power header]
J5 requires a matching external PoE powered-device (PD) and power-conversion board. Its regulated 5 V output and ground connect to the corresponding J6 power and ground pins; never wire J5 directly to the 5 V rail or GPIO. Confirm the add-on's pinout, polarity, PoE class, output rating, protection and mechanical clearance. Four pins alone do not establish compatibility, and USB-C and HAT power must not be connected as competing supplies.
:::

InHand reports a successful PoE HAT power-up, but this review did not reproduce it or record a specific HAT model, IEEE PoE class or delivered power. This is not a qualification of arbitrary PoE HATs; obtain the approved accessory details before integration.

## Controls and board identification

- **S1:** the SDK documents a power-button connection to the PMIC's `NPWRON` input, whereas the English datasheet labels it a reset button. A short-press/long-press behaviour test was not performed for this page; do not infer an unconditional reset action from that label.
- **Indicator:** Linux exposes `/sys/class/leds/red` and `/sys/class/leds/green`. Read `brightness` and `trigger` for the software state; those values alone do not verify the observed colour or every boot/shutdown indication. See [First boot](/docs/mo-62a/getting-started/first-boot/) for the documented startup sequence.
- **Board identity:** the reference image shows a model/revision silkscreen below J6. Record your own marking and assembly label; the image does not identify your board revision. See [Hardware revisions](/mo-62a/hardware-development/hardware-revisions/).

## 40-pin header (J6)

Both published [schematics](/mo-62a/hardware-development/schematics/), sheet 17, identify the expansion header as J6 and the fan connector as J1. The older SDK README calls them J9 and J6 respectively. This page follows the schematic references; also check the `USER EXPN` marking, connector shape and pin-1 indication on your actual board. Do not select a connector by a conflicting reference alone.

### Confirm the physical orientation

Orient the component side as in the [connector map](#locate-the-board-features), with J6 along the top edge and USB/Ethernet on the right. This separate diagram shows physical pin numbers, not the map's location markers:

[![J6 physical numbering viewed from the component side: outer row 2 to 40, inner row 1 to 39; pins 1 and 2 are the leftmost column, pins 39 and 40 the rightmost](/img/hardware-development/mo62a-j6-orientation.svg)](/img/hardware-development/mo62a-j6-orientation.svg)

| Position in this view | Physical numbering | How to read it |
|---|---|---|
| Upper row, toward the outside edge | 2, 4, 6, …, 40 | Left to right |
| Lower row, toward the board centre | 1, 3, 5, …, 39 | Left to right |
| Leftmost column | 2 above 1 | Pin 1 is below pin 2 |
| Rightmost column | 40 above 39 | Pin 39 is below pin 40 |

These directions apply to the component side only. Turning the board over reverses the apparent left/right orientation. Disconnect power and confirm the actual pin-1 marking before attaching jumpers or a HAT.

### Signal reference

Use physical pin numbers when wiring and SoC controller names when programming. A BCM-style HAT label such as `GPIO17` is not Linux GPIO line 17 on Mo62A. The table applies to the tested `microSD-default` configuration: pins 27/28 remain reserved for camera I²C, and power/ground pins are not GPIO. A peripheral overlay takes ownership of its associated signal pins.

For a compact standalone lookup, [open the logical pin map](/img/hardware-development/mo62a-40pin-reference.svg). It shows the same pin assignments, not the physical viewing direction.

| Physical pin | Power or SoC signal | GPIO chip / offset | Alternate function |
|---|---|---|---|
| 1 | 3.3 V | — | Power |
| 2 | 5 V | — | Power |
| 3 | `MCU_GPIO0_20` | `gpiochip0` / 20 | WKUP_I2C0 SDA |
| 4 | 5 V | — | Power |
| 5 | `MCU_GPIO0_19` | `gpiochip0` / 19 | WKUP_I2C0 SCL |
| 6 | GND | — | Ground |
| 7 | `GPIO0_39` | `gpiochip1` / 39 | GPIO |
| 8 | `GPIO1_25` | `gpiochip2` / 25 | UART5 TX |
| 9 | GND | — | Ground |
| 10 | `GPIO1_24` | `gpiochip2` / 24 | UART5 RX |
| 11 | `GPIO1_23` | `gpiochip2` / 23 | GPIO |
| 12 | `GPIO1_0` | `gpiochip2` / 0 | MCASP2 ACLKX |
| 13 | `GPIO0_42` | `gpiochip1` / 42 | GPIO |
| 14 | GND | — | Ground |
| 15 | `GPIO1_22` | `gpiochip2` / 22 | GPIO |
| 16 | `GPIO0_38` | `gpiochip1` / 38 | GPIO |
| 17 | 3.3 V | — | Power |
| 18 | `GPIO0_40` | `gpiochip1` / 40 | GPIO |
| 19 | `GPIO1_18` | `gpiochip2` / 18 | SPI0 MOSI |
| 20 | GND | — | Ground |
| 21 | `GPIO1_19` | `gpiochip2` / 19 | SPI0 MISO |
| 22 | `GPIO0_14` | `gpiochip1` / 14 | GPIO |
| 23 | `GPIO1_17` | `gpiochip2` / 17 | SPI0 CLK |
| 24 | `GPIO1_15` | `gpiochip2` / 15 | SPI0 CS0 |
| 25 | GND | — | Ground |
| 26 | `GPIO1_16` | `gpiochip2` / 16 | SPI0 CS1 |
| 27 | I2C2 SDA | Reserved | Camera bus |
| 28 | I2C2 SCL | Reserved | Camera bus |
| 29 | `GPIO0_36` | `gpiochip1` / 36 | GPIO |
| 30 | GND | — | Ground |
| 31 | `GPIO0_33` | `gpiochip1` / 33 | GPIO |
| 32 | `GPIO1_14` | `gpiochip2` / 14 | EHRPWM0 B |
| 33 | `GPIO1_13` | `gpiochip2` / 13 | EHRPWM0 A |
| 34 | GND | — | Ground |
| 35 | `GPIO0_91` | `gpiochip1` / 91 | MCASP2 AFSX |
| 36 | `GPIO1_9` | `gpiochip2` / 9 | EHRPWM1 A; controller shared with fan |
| 37 | `GPIO0_41` | `gpiochip1` / 41 | GPIO |
| 38 | `GPIO1_5` | `gpiochip2` / 5 | MCASP2 AXR0 |
| 39 | GND | — | Ground |
| 40 | `GPIO1_2` | `gpiochip2` / 2 | MCASP2 AXR1 |

### Linux names and observed state

On the tested image, `gpiochip0` is `4201000.gpio` (MCU GPIO0), `gpiochip1` is `600000.gpio` (main GPIO0), and `gpiochip2` is `601000.gpio` (main GPIO1). Confirm the names on another image instead of assuming chip indices are stable.

```bash
bootcfg show
sudo gpiodetect
sudo gpioinfo -c gpiochip2
```

[![Live Mo62A inspection showing the default boot entry, GPIO controller names, three RTC devices and ttyS2 console configuration](/img/hardware-development/mo62a-interfaces.png)](/img/hardware-development/mo62a-interfaces.png)

For driven GPIO, edge monitoring and cleanup, use the tested [GPIO & peripherals](/docs/mo-62a/application-development/gpio-and-peripherals/) procedures. In libgpiod v2, `gpioset --hold-period=2s` specifies a minimum hold period; it does not by itself mean that the process exits after two seconds. A GPIO output is held while the request remains open.

## Select a peripheral function

Choose a supplied entry with `bootcfg`; changing the default reboots the board. Confirm the live device-tree status after reboot. Do not enable the audio overlay with the GPIO/PWM loopback jumpers still attached.

| Function | Physical pins | Boot entry | Verification boundary |
|---|---|---|---|
| GPIO | Unreserved signal pins | `microSD-default` | Three pairs tested in both directions |
| UART5 | 8 TX, 10 RX | `microSD-uart5` | `/dev/ttyS3`; 115200 8N1 loopback passed |
| EHRPWM0 | 33 A, 32 B | `microSD-ehrpwm0` | Pin 33 measured at 50 Hz / 25%; pin 32 not measured |
| WKUP_I2C0 | 3 SDA, 5 SCL | `microSD-i2c0` | No external I²C peripheral tested in this review |
| SPI0 | 19, 21, 23, 24, 26 | `microSD-spi0` | No SPI loopback tested in this review |
| MCASP2 audio | 12, 35, 38, 40; 3/5 control | `microSD-audio` | Requires the matching WM8960 hardware and driver |

The combined `exp-periph` overlay is present in the SDK but is not a supplied `microSD-periph` boot entry in the tested image. Follow [Device tree overlays](/docs/mo-62a/system-configuration/device-tree-overlays/) for the supported entries, pin conflicts and recovery.

Resolve PWM controllers through `/sys/class/pwm/pwmchip*/device`: EHRPWM0 is `23000000.pwm`; the fan uses `23010000.pwm`. Do not hard-code `pwmchip0`. Header pin 36 shares the fan's EHRPWM1 controller, so it is not an independent, already-tested PWM output.

## Sources and checks

The physical-pin mapping was cross-checked against the [SDK README](https://github.com/inhandnet/Mo62A#7-hardware-reference), the per-pad device-tree definitions, the individual overlays and the published schematics. The diagram's logical mapping was checked for all 40 pins. Only the GPIO, UART5 and pin-33 PWM loopbacks linked above are electrical tests; the remaining entries are design references.

Inspect J6, J1, J4 and J2 in the [original sheet 17 preview](/mo-62a/hardware-development/schematics/#connector-circuits-sheet-17), or download the full PDF from that page. The annotated product image identifies locations; it does not replace circuit pin assignments.
