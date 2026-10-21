#!/bin/bash
# Usage: sudo reload-cycle.sh <firmware name in /lib/firmware> <cycles>
fw=$1; n=$2; HOME_RTDOC=$(dirname "$(readlink -f "$0")")
MCU=$(grep -l '^79000000.r5f$' /sys/class/remoteproc/remoteproc*/name | xargs dirname)
for i in $(seq 1 "$n"); do
  echo stop > "$MCU/state" || { echo "cycle $i: STOP FAILED ($(cat $MCU/state))"; exit 1; }
  echo -n "$fw" > "$MCU/firmware"
  echo start > "$MCU/state" || { echo "cycle $i: START FAILED"; exit 1; }
  ok=0
  for t in $(seq 1 20); do
    grep -q 'end point 14' "/sys/kernel/debug/remoteproc/${MCU##*/}/trace0" 2>/dev/null && { ok=1; break; }
    sleep 0.1
  done
  [ $ok = 1 ] || { echo "cycle $i: firmware did not reach its receive loop"; tail -3 "/sys/kernel/debug/remoteproc/${MCU##*/}/trace0"; exit 1; }
  timeout 5 $HOME_RTDOC/rpmsg_echo_latency 0 20 >/dev/null || { echo "cycle $i: echo FAILED"; exit 1; }
done
echo "PASS $n/$n cycles with $fw"
