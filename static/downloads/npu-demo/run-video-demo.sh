#!/bin/bash
# Run the installed EdgeAI applications with a video-file configuration.
# Keep control in SSH/UART: LightDM is stopped during HDMI inference.
set -euo pipefail
backend=${1:-cpp}
config=${2:-/tmp/mo-npu-video/video-demo.yaml}
case "$backend" in python|cpp) ;; *) echo 'Usage: sudo bash run-video-demo.sh [python|cpp] [config.yaml]' >&2; exit 2;; esac
[[ $EUID == 0 ]] || { echo 'Run this helper with sudo.' >&2; exit 1; }
config=$(realpath "$config")
[[ -r "$config" ]] || { echo 'Configuration not found.' >&2; exit 1; }
if pgrep -f '(^|/)(app_edgeai|app_edgeai.py)( |$)' >/dev/null; then
    echo 'Stop the existing EdgeAI application before starting another demo.' >&2
    exit 1
fi
export SOC=am62a TERM=${TERM:-xterm}
export GST_PLUGIN_PATH=/opt/ti/edgeai/gstreamer/plugins
export LD_LIBRARY_PATH=/opt/ti/edgeai/lib:/opt/ti/edgeai/gstreamer/lib
gst-inspect-1.0 v4l2h264dec >/dev/null
if [[ $backend == cpp ]]; then
    [[ -x /usr/local/bin/app_edgeai ]] || { echo 'C/C++ backend is not installed.' >&2; exit 1; }
else
    [[ -r /opt/edgeai-gst-apps/apps_python/app_edgeai.py ]] || { echo 'Python backend is not installed.' >&2; exit 1; }
fi
python3 - "$config" <<'PY'
import pathlib, sys, yaml
config = yaml.safe_load(pathlib.Path(sys.argv[1]).read_text())
for item in config['inputs'].values():
    if not pathlib.Path(item['source']).is_file():
        sys.exit('Input video is missing: ' + str(item['source']))
for item in config['models'].values():
    if not (pathlib.Path(item['model_path']) / 'artifacts').is_dir():
        sys.exit('The configured model artifacts are not installed.')
PY
rproc=/sys/class/remoteproc/remoteproc0/state
[[ $(cat /sys/class/remoteproc/remoteproc0/name) == 7e000000.dsp ]] || { echo 'Unexpected accelerator device.' >&2; exit 1; }
restore_desktop=false
systemctl is-active --quiet lightdm && restore_desktop=true
reset_c7x() {
    [[ $(cat "$rproc") != running ]] || { echo stop > "$rproc"; sleep 2; }
    echo start > "$rproc"
    sleep 4
}
cleanup() {
    status=$?
    trap - EXIT INT TERM
    reset_c7x || true
    if "$restore_desktop"; then systemctl start lightdm || true; fi
    echo '[video-demo] Finished; original desktop service state restored.'
    exit "$status"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM
systemctl stop lightdm
sleep 2
reset_c7x
echo "[video-demo] Backend: $backend; input: video file; output: board HDMI"
echo '[video-demo] Press Ctrl+C here to stop.'
if [[ $backend == cpp ]]; then
    /usr/local/bin/app_edgeai "$config" -n
else
    cd /opt/edgeai-gst-apps/apps_python
    python3 app_edgeai.py "$config" -n
fi
