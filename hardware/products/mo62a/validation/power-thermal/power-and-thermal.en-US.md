---
title: "Power & thermal"
description: "Mo62A supply ratings, cooling connections and read-only temperature and fan checks."
sidebar_position: 3
---


## Power supply and measurement boundary

These are published product ratings from page 5 of the English Mo62A Datasheet V1.0 in the [InHand Resource Center](https://www.inhand.com/en/resources-center/#/IndustrialDigitalization/AISingleBoardComputer/MO62A), not measurements from the documentation test bench.

| Item | Published value | Interpretation |
|---|---|---|
| Input | USB Type-C, 5 V | Use a suitable 5 V supply and cable |
| Supply rating | 5 V / 5 A | Check the adapter's 5 V output rating, not just its total wattage |
| Maximum consumption | 25 W | Datasheet ceiling; no idle, peak or workload power measurement published here |
| Operating temperature | 0–50 °C | Product operating range; not the same quantity as an internal SoC sensor reading |

Include USB devices, camera, fan and any HAT when sizing the supply. J6 pins 2/4 are connected to the 5 V rail; they are not a separate power budget. Do not connect competing power supplies through the header and USB-C. The board has no on-board PoE PD/power converter: J5 exposes transformer taps, not regulated 5 V. PoE operation requires a matching external PD/converter and its approved 5 V/ground connection to J6; see [Hardware interfaces](/mo-62a/hardware-development/hardware-interfaces/#other-connectors).

For an intermittent reset, first test with the recommended supply and a suitable short cable, remove nonessential peripherals after shutting down, and collect the serial boot log. Voltage-drop and power-consumption tests require external measurement equipment; no such readings were collected for this page.

## Cooling and the fan connector

Use cooling appropriate to the workload and enclosure. Keep airflow unobstructed and check operation with the final workload, rather than assuming one temperature sample proves sustained thermal performance.

The schematics identify the 5 V PWM fan connector as J1, SH1.0-4p: pin 1 is 5 V, pin 2 PWM, pin 3 GND and pin 4 tachometer. The older README calls this connector J6; check the actual connector and cable against the schematic.

Locate J1 in the [connector map](/mo-62a/hardware-development/hardware-interfaces/#locate-the-board-features) and consult the [original fan circuit on sheet 17](/mo-62a/hardware-development/schematics/#connector-circuits-sheet-17) before choosing a cable.

Do not write raw PWM sysfs values to experiment with cooling. The fan uses EHRPWM1 at `23010000.pwm`; header pin 36 also has an EHRPWM1 alternate function. Controller indices can change when another overlay is enabled. The [header PWM test](/docs/mo-62a/application-development/gpio-and-peripherals/) uses EHRPWM0 at `23000000.pwm`, not the fan controller.

## Read temperature and fan state

The following commands only read existing attributes. Discover names each time rather than assuming `hwmon3` or `pwmchip0` is stable:

```bash
for zone in /sys/class/thermal/thermal_zone*; do
  printf '%s: ' "${zone##*/}"
  tr '\n' ' ' < "$zone/type"
  cat "$zone/temp"
done

for sensor in /sys/class/hwmon/hwmon*; do
  [ -r "$sensor/fan1_input" ] || continue
  printf '%s: ' "${sensor##*/}"
  cat "$sensor/name"
  for attribute in fan1_input pwm1; do
    [ -r "$sensor/$attribute" ] || continue
    printf '  %s=' "$attribute"
    cat "$sensor/$attribute"
  done
done

for controller in /sys/class/pwm/pwmchip*; do
  printf '%s: ' "${controller##*/}"
  readlink -f "$controller/device"
done
```

[![Live read-only Mo62A inspection: three sensors at about 52 to 53 degrees C, pwmfan at 9990 RPM with raw PWM 109, fan controller at 23010000.pwm and active desktop](/img/hardware-development/mo62a-thermal.png)](/img/hardware-development/mo62a-thermal.png)

In this capture, the three thermal readings were 51709, 52371 and 53250 millidegrees Celsius; `fan1_input` was 9990 RPM and `pwm1` was 109. These are one-time observations, not a thermal qualification, a fan calibration, or a power reading. `pwm1` is a raw control value, not RPM or degrees Celsius.

For reproducible evaluation, record image version, ambient temperature, enclosure, heatsink/fan, workload, duration, CPU frequency and all thermal zones. The [AI benchmark page](/docs/mo-62a/application-development/ai/benchmarks/) records temperatures at its run boundaries but does not claim long-duration thermal stability.
